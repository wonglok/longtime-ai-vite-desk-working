import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'

const WorkTask = z.object({
  memory: z
    .string()
    .describe('write a memory for myself to read again, i output memory so that i dont forget.'),

  // currentThoughts: z
  //   .string()
  //   .describe(`Short term memory about the task that i'm currently working on.`),

  todo: z
    .array(
      z.object({
        status: z.enum(['pending', 'working', 'completed']),
        task: z.string()
      })
    )
    .describe('a todo items, mark todo items'),

  terminalCommands: z
    .array(
      z.object({
        cmd: z.string().describe('the terminal command'),
        result: z.string().describe('result of the terminal command').optional()
      })
    )
    .optional()
})

export type ExecStep = z.infer<typeof WorkTask>

export async function getStep({ multipleSteps, step, workspace, inbound, checkAborted, onEvent }) {
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
You are an AI senior developer. 
You help user write their app idea.
You are a very honest and hard working person.
You think like the way of Jesus in the bible. Single source of truth. You love proverbs in bible.
You are a person who cares for details. You read the file first before writing to it.
`.trim()
    })

    messages.push({
      role: 'system',
      content: `
here's my memory:
${step.memory}
`.trim()
    })

    if (multipleSteps) {
      let last5 = multipleSteps.slice().reverse().slice(0, 5).reverse()
      messages.push({
        role: 'user',
        content: `
# Previous Steps
previous steps (last 5 steps max):
${last5
  .map((each) => {
    return JSON.stringify(each.memory)
  })
  .join('\n')}
          `
      })
    }

    messages.push({
      role: 'user',
      content: `
"MUST HAVE" RULES:
You only work at the workspace folder: ${JSON.stringify(workspace)}
The [project-folder] name is called ${JSON.stringify(inbound.folder)}
          `
    })

    messages.push({
      role: 'user',
      content: `
Here's the user app idea:
${inbound.appSpec.trim()}
`.trim()
    })

    if ((step?.terminalCommands?.length || 0) > 0) {
      for (let each of step.terminalCommands as { cmd: string; result: string }[]) {
        messages.push({
          role: 'user',
          content: `
Here's the last terminal command:
${each.cmd}

Here's the result of it:
${each.result}
`
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
          `
      })

      onEvent({
        type: 'todo',
        todo: step!.todo
      })
    }

    return messages
  }

  let messages = await prepareMessages(step)
  onEvent({
    type: 'messages',
    messages: messages
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

    if (nextStep.terminalCommands && nextStep.terminalCommands.length) {
      for (let terminalCmd of nextStep.terminalCommands) {
        terminalCmd.result = await new Promise((resolve) => {
          return exec(
            `${terminalCmd.cmd}`,
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
