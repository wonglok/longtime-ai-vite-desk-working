import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { scanFolder } from '../utils/getSummary'
// import { scanFolder } from '../utils/getSummary'
const TodoSchema = z.object({
  status: z.enum(['pending', 'active', 'completed']),
  task: z.string().describe('task')
})

const WorkTask = z.object({
  currentThought: z
    .string()
    .describe(
      "thoughts related of the agent and of the current tasks. It's written for the agent to see again."
    ),

  todo: z.array(TodoSchema),

  terminalCalls: z
    .array(
      z.object({
        cmd: z.string().describe('command for terminal'),
        reason: z.string().describe('reason of running this command ')
      })
    )
    .describe('a list of terminal commands')
    .min(1),

  nextStep: z.string().describe('next step')
})

export type ExecStep = z.infer<typeof WorkTask>
export type TodoType = z.infer<typeof TodoSchema>

export async function getStep({ project, executionHistory, inbound, checkAborted, onEvent }) {
  let latestOneStep = executionHistory[executionHistory.length - 1]

  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let prepareMessages = async () => {
    const messages: ChatCompletionMessageParam[] = []

    messages.push({
      role: 'system',
      content: `
${inbound.systemPrompt}
`.trim()
    })

    if (latestOneStep) {
      // thought
      {
        let allCalls = `Last Thought: ${latestOneStep.currentThought}\n\n\n Last terminal calls, status and results: \n\n`
        for (let item of [latestOneStep]) {
          for (let each of item.terminalCalls as {
            reason: string
            cmd: string
            result: string
            successful: boolean
            timestamp: string
          }[]) {
            allCalls += `
Timetamp: ${each.timestamp || new Date().toString()}

The terminal command:
${each.cmd || ''}

Status of command result:
${each.successful ? `Successful` : `Failed`}

Result of command:
${each.result.trim() || ''}
`
          }
        }

        messages.push({
          role: 'user',
          content: allCalls
        })
      }
    }

    messages.push({
      role: 'user',
      content: `
# MUST HAVE RULES:
The [project] / [workspace] folder path is: ${JSON.stringify(project)}
The project name is: ${JSON.stringify(inbound.folder)}
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
Here's the original user app idea input:
${inbound.appIdea.trim()}
`.trim()
    })

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

    if (latestOneStep.todo?.length > 0) {
      messages.push({
        role: 'user',
        content: `
# Here's the latest todo list:
${latestOneStep.todo
  .map((r) => {
    return `${`[${r.status}]`} ${r.task}`
  })
  .join('\n')}

  `
      })
    }

    messages.push({
      role: 'user',
      content: `

What should we do in this step:
${latestOneStep.nextStep}

      `
    })

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
        onEvent({
          type: 'cmd_running',
          cmd_running: each.cmd
        })

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
        onEvent({
          type: 'cmd_done',
          cmd_done: each.cmd
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
