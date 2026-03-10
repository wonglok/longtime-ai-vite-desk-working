import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'

const WorkTask = z.object({
  memory: z
    .string()
    .describe(
      'write a memory of task / tood for myself to read again, i output all i need to remember, so that i dont forget.'
    ),

  // currentThoughts: z
  //   .string()
  //   .describe(`Short term memory about the task that i'm currently inprogress on.`),

  todo: z
    .array(
      z.object({
        status: z.enum(['pending', 'in-progress', 'completed']),
        task: z.string()
      })
    )
    .describe('a detailed todo list'),

  terminalCalls: z
    .array(
      z.object({
        cmd: z.string().describe('current task command line action')
      })
    )
    .describe('current task command line calls')
})

export type ExecStep = z.infer<typeof WorkTask>

export async function getStep({
  executionHistory,
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

    messages.push({
      role: 'system',
      content: `
# SOUL and IDENTITY 
I am a senior developer.
I love the bible especially the gospel of Jesus and the proverbs.
I love helping other poeple (user) to turn their app idea into software.
`.trim()
    })

    messages.push({
      role: 'user',
      content: `
    here's the latest memory of the agent:
    ${step.memory}
    `.trim()
    })

    if (executionHistory) {
      let last5 = executionHistory.slice().reverse().slice(0, 5).reverse()
      messages.push({
        role: 'user',
        content: `
# Previous working step
Previous working step (last 5 working step max):
${last5
  .map((each) => {
    return JSON.stringify(each)
  })
  .join('\n')}
          `
      })
    }

    messages.push({
      role: 'user',
      content: `
# MUST HAVE RULES:
Only work at the workspace folder: ${JSON.stringify(workspace)}
The [project-folder] name is called: ${JSON.stringify(inbound.folder)}
          `
    })

    messages.push({
      role: 'user',
      content: `
Here's the app idea:
${inbound.appSpec.trim()}
`.trim()
    })

    if ((step?.terminalCalls?.length || 0) > 0) {
      for (let each of step.terminalCalls as { cmd: string; result: string }[]) {
        messages.push({
          role: 'user',
          content: `
# Terminal Command & Result
Here's the terminal command used:
${each.cmd}
Result of command:
${each.result}
`.trim()
        })
      }
    }

    if (step.todo?.length > 0) {
      messages.push({
        role: 'user',
        content: `
Here's todo list:
${step.todo
  .map((r) => {
    return `${`[${r.status}]`} ${r.task}`
  })
  .join('\n')}

You pick the right task to work on.
          `
      })
    }

    return messages
  }

  let messages = await prepareMessages(step)
  onEvent({
    type: 'messages',
    messages: messages
  })
  onEvent({
    type: 'todo',
    todo: step.todo
  })

  if (checkAborted()) {
    return step
  }

  const nextStep = await openai.chat.completions
    .create({
      model: inbound.model,
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'worktask',
          schema: WorkTask.toJSONSchema()
        }
      },
      reasoning_effort: 'high'
    })
    .then((response) => {
      //
      // console.log(response.choices[0].message)
      //
      return JSON.parse(response.choices[0].message.content!) as ExecStep
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  if (nextStep) {
    onEvent({
      type: 'todo',
      todo: nextStep.todo
    })

    if (nextStep.terminalCalls && nextStep.terminalCalls.length) {
      for (let each of nextStep.terminalCalls) {
        ;(each as { result: string; cmd: string }).result = await new Promise((resolve) => {
          return exec(
            `${each.cmd}`,
            {
              cwd: `${workspace}`
            },
            (error, stdout, stderr) => {
              if (error) {
                console.log('error', error)
                return resolve(`error: ${error}`)
              }
              if (stderr) {
                console.error(`stderr: ${stderr}`)
                return resolve(`error: ${stderr}`)
              }
              // console.log(`stdout: ${stdout}`)

              resolve(stdout)
            }
          )
        })

        onEvent({
          type: 'terminalCalls',
          terminalCalls: nextStep.terminalCalls
        })
      }
    }
  }

  // console.log(nextStep)

  // onEvent({
  //   type: 'nextStep',
  //   text: JSON.stringify(nextStep, null, '\t')
  // })

  return nextStep
}

//
