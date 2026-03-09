import { exec } from 'child_process'
import OpenAI from 'openai'
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam
} from 'openai/resources/index.mjs'
import { z } from 'zod'

const WorkTask = z.object({
  memory: z
    .string()
    .describe(
      'write a memory for myself to read, which summarise all the memories in my mind so that i dont forget.'
    ),

  activity: z.discriminatedUnion('action', [
    z.object({
      action: z.literal('think'),
      thought: z.string().describe('thought process')
    }),
    z.object({
      //
      action: z.literal('use-terminal').describe('use terminal to execute commands'),
      command: z.string().describe('terminal command')
    })
  ]),

  nextStep: z.string().describe('next step for me to work on in detail'),

  stop: z.boolean().describe('needs to stop or no more next step')
})

export type WorkStep = z.infer<typeof WorkTask> & {
  lastCommandResult?: string
}

export async function getStep({ lastStep, workspace, checkAborted, inbound, onEvent }) {
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let insertLastStep = (step: WorkStep) => {
    let array: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `
Here's the memory i wrote for myself to read, which summarise all the memories in my mind so that i dont forget:
${lastStep.memory}`
      }
    ]

    // if (step?.activity?.action === 'nothing') {
    //   array.push({
    //     role: 'user',
    //     content: ``
    //   })
    // }

    if (step?.activity?.action === 'use-terminal') {
      array.push({
        role: 'user',
        content: `
Here's the last terminal command i wrote:
${lastStep.activity.command}`
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

        ...insertLastStep(lastStep),

        {
          role: 'user',
          content: `
Instruction:
You only work at the workspace:  ${workspace}

Here's the user message
${inbound.appSpec}
          `
        },

        {
          role: 'user',
          content: `
Here's the next step:
${lastStep.nextStep}
          `
        }
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
      // console.log(response.choices[0].message)
      return JSON.parse(response.choices[0].message.content!) as WorkStep
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  if (workstep) {
    console.log(JSON.stringify(workstep, null, '\t'))

    if (workstep.activity.action === 'use-terminal') {
      let terminalCmd = workstep.activity.command
      let termianlResult = await new Promise((resolve) => {
        return exec(`${terminalCmd}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return resolve(null)
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`)
            return resolve(null)
          }
          console.log(`stdout: ${stdout}`)

          resolve(stdout)
        })
      })

      workstep.lastCommandResult = termianlResult as string

      console.log(termianlResult)
    }
  }

  return workstep
}
