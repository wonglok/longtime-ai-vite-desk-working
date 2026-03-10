import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'

const WorkTask = z.object({
  thought: z
    .string()
    .describe('thought of the agent and the current tasks for the agent to see again'),

  todo: z
    .array(
      z.object({
        status: z.enum(['pending', 'in-progress', 'completed']),
        task: z.string().describe('task description')
      })
    )
    .describe('a concise and succinct todo list'),

  terminalCalls: z
    .array(
      z.object({
        cmd: z.string().describe('command for terminal'),
        reason: z.string().describe('reason of running this command')
      })
    )
    .describe('terminal commands')
    .min(1)
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
here's the latest thought of the agent:
${step.thought}
    `.trim()
    })

    if (executionHistory) {
      let last5 = executionHistory.slice().reverse().slice(0, 5).reverse()
      messages.push({
        role: 'user',
        content: `
# Previous execution history
(last 5 execution history step):

${last5
  .map((each) => {
    let cloned = { ...each }

    return JSON.stringify({
      ...cloned
    })
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
Here's the latest app specification:
${inbound.appSpec.trim()}

## Todo:
check the latest app spec against the current todo list to see if we need to update it todo list.
`.trim()
    })

    if ((step?.terminalCalls?.length || 0) > 0) {
      for (let each of step.terminalCalls as { reason: string; cmd: string; result: string }[]) {
        messages.push({
          role: 'user',
          content: `
# Terminal Command & Result

## The terminal command:
${each.cmd || ''}

## Reason of running this command:
${each.reason || ''}

## Result of command:
${each.result || ''}
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
        reasoning_effort: 'medium',
        stream: true,
        temperature: 0
      },
      { signal }
    )
    .then(async (response) => {
      function extractThinkingContent(response: string): string {
        // // Regex to find content inside <think>...</think>
        // // 's' flag allows '.' to match newlines
        // const regex = /<think>(.*?)<\/think>/gs
        // const match = regex.exec(response)

        // // Return the content if found, otherwise return an empty string
        // return match ? match[1].trim() : ''

        let result = response.replace('<think>', '').replace('</think>', '')

        return result
      }

      // return JSON.parse(response.choices[0].message.content!) as ExecStep
      //
      let tt = ''
      for await (let event of response) {
        tt += event.choices[0]?.delta?.content || ''

        let extracted = `${extractThinkingContent(`${tt}`.trim())}`.trim()
        onEvent({ type: 'brain', brain: extracted })
      }

      let extracted = `${extractThinkingContent(`${tt}`.trim())}`.trim()
      console.log('extracted', extracted)

      return JSON.parse(extracted)
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
        ;(each as { result: string; cmd: string; reason: string }).result = await new Promise(
          (resolve) => {
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

                resolve(`Successful: ${stdout}`)
              }
            )
          }
        )

        console.log('running calls...', each.cmd)

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

//
