import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
// import { scanFolder } from '../utils/getSummary'

const WorkTask = z.object({
  futureThought: z
    .string()
    .describe(
      "future thoughts related of the agent and of the current tasks. It's written for the agent to see again. In thrid person speech."
    ),

  currentThought: z
    .string()
    .describe(
      "current thoughts related of the agent and of the current tasks. It's written for the agent to see again. In thrid person speech."
    ),

  todo: z
    .array(
      z.object({
        status: z.enum(['pending', 'active', 'completed']),
        task: z.string().describe('task description')
      })
    )
    .describe('a todo list')
    .min(1),

  terminalCalls: z
    .array(
      z.object({
        cmd: z.string().describe('command for terminal')
        // reason: z.string().describe('reason of running this command ')
      })
    )
    .describe('a list of terminal commands')
    .min(1)
})

export type ExecStep = z.infer<typeof WorkTask>

export async function getStep({
  plan,

  executionHistory,
  step,
  workspace,
  inbound,
  checkAborted,
  onEvent
}) {
  const appFolder = inbound.appFolder
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

# MUST HAVE GUIDELINES:

current workspace path: "${workspace}"
current working directory (cwd): "${workspace}"

current cli folder: "${workspace}/cli"

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of npm modules
DO NOT start server when you done all the coding. but run "npm run install" and tell user about your progress update
`.trim()
    })

    if (executionHistory) {
      let lastFew = executionHistory
        .slice()
        .reverse()
        .slice(0, 5)
        .reverse()
        .filter((r) => r.terminalCalls)

      messages.push({
        role: 'user',
        content: `
# Previous terminal cli call execution history (${lastFew.length})
${lastFew
  .map((item, idx) => {
    let str = ``
    for (let each of item.terminalCalls as {
      reason: string
      cmd: string
      result: string
      successful: boolean
      timestamp: string
    }[]) {
      str += `----------Terminal Command & Result BEGIN----------
## Timetamp: ${each.timestamp || new Date().toString()}

## Reason of running this command:
${each.reason || ''}

## Status of command result:
${each.successful ? `Successful` : `Failed`}

## The terminal command:
${each.cmd || ''}

## Result of command:
${each.result.trim() || ''}
----------Terminal Command & Result END---------- 

`
    }

    return `${str}`
  })
  .join('\n')}
      `.trim()
      })
    }

    //     messages.push({
    //       role: 'user',
    //       content: `# Instruction: MUST write summary of each code file
    // - whever you write a .js/.ts/.tsx/.jsx code file, you write a summary at the top of the file like this format:
    // "//SUMMARY: [summary of the file...]"

    // ${summary}
    //       `.trim()
    //     })

    //     messages.push({
    //       role: 'user',
    //       content: `
    // Here's the latest app specification:
    // ${inbound.appSpec.trim()}

    // ## Sync todo list:
    // check the latest app spec against the current todo list and current code files to see if we need to update it todo list.
    // `.trim()
    //     })

    if (step.todo?.length > 0) {
      messages.push({
        role: 'user',
        content: `
Here's the latest todo list:
${step.todo
  .map((r) => {
    return `${`[${r.status}]`} ${r.task}`
  })
  .join('\n')}

You pick the right task to work on.
          `
      })
    }

    //     if (inbound.errorMessage.trim()) {
    //       messages.push({
    //         role: 'user',
    //         content: `
    // Here's some debug message from user:
    // ${inbound.errorMessage}
    //           `
    //       })
    //     }

    //     if ((inbound.modifyMessage || '').trim()) {
    //       messages.push({
    //         role: 'user',
    //         content: `
    // Here's a modification message from user:
    // ${inbound.modifyMessage}
    //           `
    //       })
    //     }

    if ((step?.terminalCalls?.length || 0) > 0) {
      for (let each of step.terminalCalls as {
        cmd: string
        result: string
        successful: boolean
      }[]) {
        messages.push({
          role: 'user',
          content: `
# Here's the last Terminal Call

## The terminal command:
${each.cmd || ''}

## Status of command result:
${each.successful ? `Successful` : `Failed`}

## Result of command:
${each.result || ''}
    `.trim()
        })
      }
    }

    messages.push({
      role: 'user',
      content: `
Here's what you considered before:
${step.currentThought}
    `.trim()
    })

    messages.push({
      role: 'user',
      content: `
Here's what you should consider:
${step.futureThought}
    `.trim()
    })

    return messages
  }

  let messages = await prepareMessages(step)

  console.log(messages)

  onEvent({
    type: 'messages',
    messages: messages
  })

  onEvent({
    type: 'todo',
    todo: step.todo
  })

  const controller = new AbortController()
  const signal = controller.signal

  const intrv = setInterval(() => {
    if (!signal.aborted && checkAborted()) {
      clearInterval(intrv)
      controller.abort()
    }
  }, 1)

  const nextStep = await openai.chat.completions
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
        reasoning_effort: 'none',
        temperature: 0
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

  clearInterval(intrv)

  if (nextStep) {
    onEvent({
      type: 'todo',
      todo: nextStep.todo
    })

    if (nextStep.terminalCalls && nextStep.terminalCalls.length) {
      for (let each of nextStep.terminalCalls) {
        let res: any = await new Promise((resolve) => {
          return exec(
            `${each.cmd}`,
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

        console.log(each.cmd)
        console.log((each as any).result)

        onEvent({
          type: 'terminalCalls',
          terminalCalls: nextStep.terminalCalls
        })
      }
    }
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
