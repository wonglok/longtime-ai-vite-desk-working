import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { scanFolder } from '../utils/getSummary'
import { writeFile } from 'fs/promises'

const ReviewTask = z.object({
  todo: z.array(
    z.discriminatedUnion('status', [
      z
        //
        .object({
          status: z.literal('pending'),
          task: z.string().describe('task description')
        })
        .describe('pending task'),
      z
        //
        .object({
          status: z.literal('completed'),
          task: z.string().describe('task description')
        })
        .describe('completed task'),
      z
        //
        .object({
          status: z.literal('in-progress'),
          task: z.string().describe('task description')
        })
        .describe('in-progress task')
    ])
  )
})
export type ReviewTaskStep = z.infer<typeof ReviewTask>

const WorkTask = z.object({
  whatToDoNow: z.string(),

  filesToBeWritten: z
    .array(
      z.object({
        path: z.string(),
        content: z.string()
      })
    )
    .describe('what codes needs to be written for the current task, max 3 files.')
    .max(3),

  whatTodoNext: z.string().describe('think 1-2 sentences about what todo next'),

  terminalCalls: z
    .array(
      z.object({
        command: z.string().describe('command for terminal')
      })
    )
    .describe('What to do next')
    .min(1)
})

export type ExecStep = z.infer<typeof WorkTask>

export async function writeCode({
  memory = [],
  plan,
  // executionHistory,
  step,
  workspace,
  inbound,
  checkAborted,
  onEvent
  //
}) {
  // const appFolder = inbound.appFolder
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let prepareMessages = async (step: ExecStep) => {
    const messages: ChatCompletionMessageParam[] = []

    messages.push({
      role: 'system',
      content: `
${plan}

# MUST FOLLOW GUIDELINES:
MUST NOT Manually create nextjs folders.
When we need to init the nextjs, MUST run command line: "cd ${workspace}"; npx create-next-app@latest nextjs --ts --tailwind --no-linter --src-dir --webpack --use-npm --skip-install --yes"

current workspace path: "${workspace}/nextjs"
current working directory (cwd): "${workspace}/nextjs"

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of npm modules
MUST use --save when you use "npm install"
`.trim()
    })

    let files = await (await scanFolder(workspace)).trim()

    if (files) {
      messages.push({
        role: 'user',
        content: `
${files}
    `.trim()
      })
    }

    if (memory?.length > 0) {
      for (let each of memory
        .slice(0, memory.length - 1 - 1)
        .slice()
        .reverse()
        .slice(0, 25)
        .reverse() as {
        command: string
        timestamp: string
        successful: boolean
      }[]) {
        messages.push({
          role: 'user',
          content: `
## Timestmap: ${each.timestamp || ''}
## Command: ${each.command || ''}
## Status: ${each.successful ? `Successful` : `Failed`}
    `.trim()
        })
      }
    }

    if ((step?.terminalCalls?.length || 0) > 0) {
      for (let each of step.terminalCalls as {
        command: string
        result: string
        timestamp: string
        successful: boolean
      }[]) {
        messages.push({
          role: 'user',
          content: `
## Timestmap: ${each.timestamp || ''}
## Command: ${each.command || ''}
## Status: ${each.successful ? `Successful` : `Failed`}
## Result: 
${each.result || ''}
    `.trim()
        })
      }
    }

    if (step.whatTodoNext) {
      messages.push({
        role: 'user',
        content: `
What to do now:
${step.whatTodoNext}
        `.trim()
      })
    }

    //     // todo list
    //     if (typeof step.todo !== 'undefined' && step?.todo?.length > 0) {
    //       messages.push({
    //         role: 'user',
    //         content: `
    // # Todo list:
    // ${step.todo
    //   .map((r) => {
    //     return `${`[${r.status}]`} ${r.task}`
    //   })
    //   .join('\n')}

    // # Instruction
    // 1. when there's no in-progress task, pick the first task to work on and mark it as "in-progress".
    //         `
    //       })
    //     }

    messages.push({
      role: 'user',
      content: 'keep going. thank you!'
    })

    return messages
  }

  let messages = await prepareMessages(step)

  onEvent({
    type: 'messages',
    messages: messages
  })

  onEvent({
    type: 'todo',
    todo: step.todo || []
  })

  const controller = new AbortController()
  const signal = controller.signal

  const intrv = setInterval(() => {
    if (!signal.aborted && checkAborted()) {
      clearInterval(intrv)
      controller.abort()
    }
  }, 1)

  onEvent({
    type: 'nProgressStart',
    nProgressStart: ``
  })

  const nextStep: ExecStep = await openai.chat.completions
    .create(
      {
        model: inbound.model,
        messages: messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'worktask',
            schema: WorkTask.toJSONSchema()
          }
        },
        reasoning_effort: 'low',
        temperature: 0.2
      },
      { signal }
    )
    .then(async (response) => {
      return JSON.parse(response.choices[0].message.content!) as ExecStep
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  onEvent({
    type: 'nProgressEnd',
    nProgressEnd: ``
  })

  clearInterval(intrv)

  if (nextStep) {
    // onEvent({
    //   type: 'todo',
    //   todo: nextStep.todo || []
    // })

    onEvent({
      type: 'beforeRun',
      beforeRun: nextStep.terminalCalls
    })

    if (nextStep.filesToBeWritten && nextStep.filesToBeWritten.length > 0) {
      for await (let file of nextStep.filesToBeWritten) {
        //
        let path = file.path
        let content = file.content

        console.log(path, content)

        await writeFile(path, content, 'utf8').catch((er) => {
          console.error(er)
        })

        //
      }
    }
    if (nextStep.terminalCalls && nextStep.terminalCalls.length) {
      //
      for (let each of [...nextStep.terminalCalls]) {
        onEvent({
          type: 'cmd_begin',
          cmd_begin: `${each.command}`
        })

        if (`${each.command}`.includes('npm run dev')) {
          checkAborted()
          return null
        }

        let res: any = await new Promise((resolve) => {
          return exec(
            `${each.command}`,
            {
              cwd: `${workspace}`
            },
            (error, stdout, stderr) => {
              if (error) {
                console.log('error', error)
                return resolve({ successful: false, result: `${stderr}` })
              }
              if (stderr) {
                console.error(`error: ${stderr}`)
                return resolve({ successful: false, result: `${stderr}` })
              }

              resolve({ successful: true, result: `${stdout}` })
            }
          )
        })

        ;(each as any).successful = res.successful
        ;(each as any).result = res.result.trim()
        ;(each as any).timestamp = new Date().toString()

        memory.push({
          timestamp: new Date().toString(),
          command: each.command,
          successful: res.successful
        })

        console.log(each.command)
        console.log((each as any).result)

        onEvent({
          type: 'cmd_end',
          cmd_end: each.command
        })

        onEvent({
          type: 'duringRun',
          duringRun: nextStep.terminalCalls
        })
      }
    }

    onEvent({
      type: 'afterRun',
      afterRun: []
    })
  } else {
    return null
  }

  // console.log(nextStep)

  // onEvent({
  //   type: 'nextStep',
  //   text: JSON.stringify(nextStep, null, '\t')
  // })

  return nextStep
}

//
