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
      thought: z.string().describe('thought')
    }),
    z.object({
      //
      action: z.literal('use-terminal'),
      command: z.string().describe('terminal command')
    })
  ]),

  stop: z.boolean().describe('needs to stop the work')
})

export type WorkStep = z.infer<typeof WorkTask>

export async function getStep({ lastStep, workspace, checkAborted, inbound, onEvent }) {
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let insertLast = (step: WorkStep) => {
    let array: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `
Here's the last memory of myself:
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

    return array
  }

  const response = await openai.chat.completions
    .create({
      model: inbound.model,
      messages: [
        {
          role: 'system',
          content: `
You are an AI senior developer.

The current workspace is: ${workspace}

You output a working loop.
          `.trim()
        },

        ...insertLast(lastStep),

        {
          role: 'user',
          content: `
Instruction:
You only work at the workspace:  ${workspace}

Here's the user message
${inbound.appSpec}
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
      return JSON.parse(response.choices[0].message.content!)
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  console.log(JSON.stringify(response, null, '\t'))

  return response
}
