import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
// import { scanFolder } from '../utils/getSummary'

const WorkTask = z
  .object({
    terminalCalls: z
      .array(
        z.object({
          command: z.string().describe('command for terminal')
        })
      )
      .describe('a list of terminal commands'),

    todo: z.array(z.object({})).max(0),

    // todo: z
    //   .array(
    //     z
    //       .object({
    //         status: z.enum(['pending', 'in-progress', 'completed']),
    //         task: z.string().describe('task description')
    //       })
    //       .describe('todo task')
    //   )
    //   .describe('a todo list')
    //   .min(1),

    currentThought: z
      .string()
      .describe(
        "current thoughts related of the agent and of the current tasks. It's written for the agent to see again. Begin sentences with the 'The Agent ...' instead of 'I'."
      ),

    futureThought: z
      .string()
      .describe(
        "future thoughts related of the agent and of the current tasks. It's written for the agent to see again. Begin sentences with the 'The Agent ...' instead of 'I'."
      )
  })
  .describe('memory dump of the agent and the todo status as well as the logs of terminal calls')

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

# MUST FOLLOW GUIDELINES:

current workspace path: "${workspace}"
current working directory (cwd): "${workspace}"

current "next folder": "${workspace}/nextjs"

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of npm modules
DO NOT start server when you done all the coding. but run "npm run install" and tell user about your progress update

If there's no "nextjs folder": "npx create-next-app@latest nextjs --no-linter --js --tailwind --app --src-dir --webpack --use-npm"
`.trim()
    })

    if ((step?.terminalCalls?.length || 0) > 0) {
      for (let each of step.terminalCalls as {
        command: string
        result: string
        successful: boolean
      }[]) {
        messages.push({
          role: 'user',
          content: `
# Here's the last Terminal Call

## The terminal command:
${each.command || ''}

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
    Here's the previous thought:
    ${step.currentThought}
        `.trim()
    })

    messages.push({
      role: 'user',
      content: `
    Here's the current thought:
    ${step.futureThought}
        `.trim()
    })

    if (step?.todo?.length > 0) {
      messages.push({
        role: 'user',
        content: `
# Todo list:
${step.todo
  .map((r) => {
    return `${`[${r.status}]`} ${r.task}`
  })
  .join('\n')}

# Instruction
1. when there's no in-progress task, pick the first task to work on and mark it as "in-progress".
          `
      })
    }

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

        console.log(each.command)
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
