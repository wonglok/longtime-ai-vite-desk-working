import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { scanFolder } from '../utils/getSummary'
import { writeFile } from 'fs/promises'
// import moment from 'moment'
// import { Stonebox } from '@plust/stonebox'
import { execCommand } from './execCommand'
import { join } from 'path'

const WorkTask = z.object({
  // whatToDoNow: z.string(),

  filesToBeWritten: z
    .array(
      z.object({
        path: z.string(),
        content: z.string()
      })
    )
    .min(0)
    .max(1)
    .describe('what file needs to be written for the current task, 1 file max'),

  // fileToRead: z
  //   .array(
  //     z.object({
  //       path: z.string()
  //     })
  //   )
  //   .describe('what codes needs to be read for the current task, max 3 files.')
  //   .max(3),

  whatTodoNext: z.string().describe('think 1-2 sentences about what todo next'),
  terminalCalls: z
    .array(
      z.object({
        command: z.string().describe('1 command only')
      })
    )
    .min(0)
    .max(1)
    .describe('"terminal spawns'),

  actionLog: z
    .string()
    .describe(
      'short action log 1-2 short sentences for AI agent to follow up the progress of the current task'
    ),

  terminateDevelopmentProcess: z.boolean().describe('terminate development process')
})

export type ExecStep = z.infer<typeof WorkTask>

export async function writeCode({
  memory = [],
  plan,
  step,
  workspace,
  inbound,
  checkAborted,
  onEvent
}) {
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let prepareMessages = async (step: ExecStep) => {
    const messages: ChatCompletionMessageParam[] = []

    //
    //
    messages.push({
      role: 'system',
      content: `
${plan}

# GUIDELINES:

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of node modules
MUST NOT run "npm run dev"

YOU MUST WORK Within folder: "${workspace}/code"
`.trim()
    })

    let files = await (await scanFolder(`${workspace}/code`)).trim()

    if (files) {
      messages.push({
        role: 'user',
        content: `
${files}
    `.trim()
      })
    }

    // let latest50Memory = `# Last 100 action logs: \n\n\n`

    if (memory?.length > 0) {
      for (let each of memory
        .slice(0, memory.length - 1 - 1)
        .slice()
        .reverse()
        .slice(0, 100)
        .reverse() as {
        actionLog: string
        timestamp: string
      }[]) {
        //
        // Time: (${moment(each.timestamp).fromNow()})
        //
        let msg = `
Time: ${each.timestamp}
Action: ${each.actionLog || ''}
    `.trim()

        messages.push({
          role: 'user',
          content: msg
        })
      }
    }

    let terminalCallsText = ''

    if ((step?.terminalCalls?.length || 0) > 0) {
      for (let each of step.terminalCalls as {
        command: string
        result: string
        timestamp: string
        successful: boolean
      }[]) {
        let item = `
Time: ${each.timestamp || ''}
Command: ${each.command || ''} 
Result: ${each.successful ? `Successful` : `Failed`}
${each.result || ''}
    `.trim()

        terminalCallsText += `${item}\n`
      }

      messages.push({
        role: 'user',
        content: terminalCallsText
      })
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
      content: `continue work if needed. thank you for all your hard work! \n 
# Guidelines:

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of node modules
MUST NOT run "npm run dev"

YOU MUST WORK Within folder: "${workspace}/code"

Please also output an "skill.md" markdown file with all example features as well.
Install all the node_modules via npm.

`
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
        reasoning_effort: 'medium',
        temperature: 0.2
      },
      { signal }
    )
    .then((response) => {
      // console.log(response.choices[0].message)

      let msg = response.choices[0].message as any
      let str = msg.reasoning_content || msg.content || '{}'

      return JSON.parse(`${str}`) as ExecStep
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  onEvent({
    type: 'nProgressStart',
    nProgressStart: ``
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

        // console.log(path, content, workspace)

        if (!path.startsWith(`${workspace}/code`)) {
          path = join(`${workspace}`, 'code', path)
        }

        await writeFile(path, content, 'utf8').catch((er) => {
          console.error(er)
        })
      }
    }

    if (nextStep.terminalCalls && nextStep.terminalCalls.length) {
      //
      for (let each of [...nextStep.terminalCalls]) {
        onEvent({
          type: 'cmd_begin',
          cmd_begin: `${each.command}`
        })

        if (
          `${each.command}`.includes('npm run dev') ||
          `${each.command}`.includes('yarn run dev')
        ) {
          //

          execCommand({
            spawnCmd: 'npm',
            args: ['run', 'dev'],
            onEvent,
            cwd: `${workspace}/code`
          }).then((data) => {
            console.log(data)
          })
          ;(each as any).successful = true
          ;(each as any).result = `Running npm run dev`
          ;(each as any).timestamp = new Date().toString()

          // console.log(each.command)
          // console.log((each as any).result)

          onEvent({
            type: 'cmd_end',
            cmd_end: each.command
          })

          onEvent({
            type: 'duringRun',
            duringRun: nextStep.terminalCalls
          })

          continue
        }

        let res: any = await new Promise(async (resolve) => {
          return exec(
            `${each.command}`,
            {
              cwd: `${workspace}/code`
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

    memory.push({
      idx: memory.length,
      timestamp: new Date().toString(),
      actionLog: nextStep.actionLog
    })
  } else {
    return null
  }

  onEvent({
    type: 'nProgressEnd',
    nProgressEnd: ``
  })

  // console.log(nextStep)
  // onEvent({
  //   type: 'nextStep',
  //   text: JSON.stringify(nextStep, null, '\t')
  // })

  return nextStep
}

//
