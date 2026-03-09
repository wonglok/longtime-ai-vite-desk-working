import { exec } from 'child_process'
import OpenAI from 'openai'
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam
} from 'openai/resources/index.mjs'
import { z } from 'zod'

const WorkTask = z.object({
  longTermMemory: z
    .string()
    .describe(
      'write a longTermMemory for myself to read, which summarise all the memories in my mind so that i dont forget.'
    ),

  currentThought: z
    .string()
    .describe(`Short term memory about the task that i'm currently working on.`),
  terminal: z
    .object({
      command: z.string().describe('terminal command')
    })
    .optional(),

  todo: z.string().describe('next step to work on, with checkboxes [] or [x]'),

  end: z.boolean().describe('needs to end and no more next step to work with')
})

export type WorkStep = z.infer<typeof WorkTask> & {
  lastCommandResult?: string
}

export async function getStep({ step, workspace, checkAborted, inbound, onEvent }) {
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  console.log('step', step)
  let insertLastStep = (step: WorkStep) => {
    let array: ChatCompletionMessageParam[] = []

    if (step.longTermMemory) {
      array.push({
        role: 'user',
        content: `
Here's the longTermMemory i wrote for myself to read, which summarise all the memories in my mind so that i dont forget:
${step.longTermMemory}`
      })
    }

    if (step?.currentThought) {
      array.push({
        role: 'user',
        content: `
Here's the last currentThought (short term memory):
${step?.currentThought}`
      })
    }

    if (step?.terminal) {
      array.push({
        role: 'user',
        content: `
Here's the last terminal command i wrote:
${step?.terminal}`
      })
    }

    if (step.lastCommandResult) {
      array.push({
        role: 'user',
        content: `
Here's the result from the terminal command i wrote before:
${step.lastCommandResult}`
      })
    }

    if (step.todo) {
      array.push({
        role: 'user',
        content: `
Here's the todo that i wrote for me before:
${step.todo}
          `
      })
    }

    return array
  }

  const workstep = await openai.chat.completions
    .create({
      model: inbound.model,
      messages: [
        {
          role: 'system',
          content: `
You are an AI senior developer.

The current workspace is: ${workspace}

You do things step by step.
          `.trim()
        },

        {
          role: 'user',
          content: `
Instruction:
You only work at the workspace:  ${workspace}

Here's the user app idea:
${inbound.appSpec}
          `
        },

        ...insertLastStep(step)
      ],
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
      return JSON.parse(response.choices[0].message.content!) as WorkStep
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  if (workstep) {
    if (workstep?.terminal?.command) {
      let terminalCmd = workstep.terminal?.command

      let termianlResult = await new Promise((resolve) => {
        return exec(
          `${terminalCmd}`,
          {
            cwd: `${workspace}`
          },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return resolve(null)
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`)
              return resolve(null)
            }
            // console.log(`stdout: ${stdout}`)

            resolve(stdout)
          }
        )
      })

      workstep.lastCommandResult = termianlResult as string
    } else {
      workstep.lastCommandResult = ''
    }
  }

  return workstep
}
