import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import json2md from 'json2md'
import { table } from 'console'

const WorkTask = z.object({
  // memory: z
  //   .string()
  //   .describe('write a memory for myself to read again, i output memory so that i dont forget.'),

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

  terminalCMD: z.string().describe('terminal command').optional()
})

export type ExecStep = z.infer<typeof WorkTask> & {
  lastCommandResult?: string
  lastCommandCall?: string
}

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
# IDENTITY
You are an AI senior developer. 
You help user write their app idea.

`.trim()
    })

    if (multipleSteps) {
      let last5 = multipleSteps.slice().reverse().slice(0, 5).reverse()
      messages.push({
        role: 'user',
        content: `
previous steps (last 5 steps max):
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

    if (step?.lastCommandCall) {
      messages.push({
        role: 'user',
        content: `
Here's the last terminal command:
${step?.lastCommandCall}`
      })
    }

    if (step?.lastCommandResult) {
      messages.push({
        role: 'user',
        content: `
Here's the last terminal result:
${step.lastCommandResult}`
      })
    }

    if (step.todo) {
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
      }
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
      todo: nextStep!.todo
    })

    if (nextStep?.terminalCMD) {
      const terminalCmd = nextStep.terminalCMD

      const termianlResult = await new Promise((resolve) => {
        return exec(
          `${terminalCmd}`,
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

      nextStep.lastCommandCall = terminalCmd as string
      nextStep.lastCommandResult = termianlResult as string
    } else {
      nextStep.lastCommandCall = ''
      nextStep.lastCommandResult = ''
    }
  }

  console.log(nextStep)

  // onEvent({
  //   type: 'nextStep',
  //   text: JSON.stringify(nextStep, null, '\t')
  // })

  return nextStep
}

//
