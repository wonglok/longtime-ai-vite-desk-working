import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { scanFolder } from '../utils/getSummary'
// import { scanFolder } from '../utils/getSummary'
const TodoSchema = z.object({
  status: z.enum(['pending', 'active', 'completed']),
  task: z.string().describe('task description')
})

const WorkTask = z.object({
  thought: z
    .string()
    .describe(
      "thoughts related of the agent and of the current tasks. It's written for the agent to see again."
    ),

  todo: z.array(TodoSchema).describe('a todo list').min(1),

  terminalCalls: z
    .array(
      z.object({
        cmd: z.string().describe('command for terminal'),
        reason: z.string().describe('reason of running this command ')
      })
    )
    .describe('a list of terminal commands')
    .min(1)
})

export type ExecStep = z.infer<typeof WorkTask>
export type TodoType = z.infer<typeof TodoSchema>

export async function getStep({ project, executionHistory, inbound, checkAborted, onEvent }) {
  let lastFewSteps = executionHistory.slice().reverse().slice(0, 3).reverse()

  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let prepareMessages = async () => {
    const messages: ChatCompletionMessageParam[] = []

    messages.push({
      role: 'system',
      content: `
${inbound.soul}
`.trim()
    })

    if (lastFewSteps) {
      for (let item of lastFewSteps) {
        let time = item.timestamp ? `[${item.timestamp}]` : ``
        let content = `
        
# The Thought of that moment i was having ${time}:
${item.thought}

`

        for (let each of item.terminalCalls as {
          reason: string
          cmd: string
          result: string
          successful: boolean
          timestamp: string
        }[]) {
          let eachHistory = `
----------Terminal Command & Result BEGIN----------
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

          content += eachHistory
        }

        messages.push({
          role: 'user',
          content: content
        })
      }

      //
    }

    messages.push({
      role: 'user',
      content: `
# MUST HAVE RULES:
You only write code at this project folder: ${JSON.stringify(project)}
The [project] folder name is: ${JSON.stringify(inbound.folder)}
      `
    })

    const summary = await scanFolder(project)
    messages.push({
      role: 'user',
      content: `# Instruction: MUST write summary of each code file
    - whever you write a .js/.ts/.tsx/.jsx code file, you write a summary at the top of the file like this format:
    "//SUMMARY: [summary of the file...]"

    ${summary}
          `.trim()
    })

    messages.push({
      role: 'user',
      content: `
Here's the latest app specification:
${inbound.appSpec.trim()}

## Sync todo list:
check the latest app spec against the current todo list and current code files to see if we need to update it todo list.
`.trim()
    })

    let lastStep = lastFewSteps[lastFewSteps.length - 1]
    if (lastStep.todo?.length > 0) {
      messages.push({
        role: 'user',
        content: `
# Here's the latest todo list:
${lastStep.todo
  .map((r) => {
    return `${`[${r.status}]`} ${r.task}`
  })
  .join('\n')}

# Here's the latest thought of the agent:
${lastStep.thought}
          `
      })
    }

    if ((inbound.errorMessage || '').trim()) {
      messages.push({
        role: 'user',
        content: `
# Here's some debug message from user:
${inbound.errorMessage}
          `
      })
    }

    if ((inbound.modifyMessage || '').trim()) {
      messages.push({
        role: 'user',
        content: `
# Here's a modification message from user:
${inbound.modifyMessage}
          `
      })
    }

    return messages
  }

  let messages = await prepareMessages()
  onEvent({
    type: 'messages',
    messages: messages
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
    .then((data: any) => {
      data.timestamp = new Date().toString()

      return data
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
              cwd: `${project}`
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

  return JSON.parse(JSON.stringify(nextStep))
}

//
