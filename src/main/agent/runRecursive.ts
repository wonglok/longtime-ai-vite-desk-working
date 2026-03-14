import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import OpenAI from 'openai'
import z from 'zod'

export const CoderSchema = z
  .object({
    _id: z.string().describe('small-id-for-unique-object-id'),
    filePath: z.string().describe('file location path'),
    thought: z.string().describe(`thouht of the agent for that task`),
    systemPrompt: z
      .string()
      .describe(
        'AI agent context: system prompt message for the task and the code to be written. you need to follow the system prompt for this.'
      ),
    userPrompt: z
      .string()
      .describe(
        'AI agent context: user prompt message for the task and the code file to be written and with file content summary'
      )
  })
  .describe('a development plan for AI Coding Agent to generate that code file')

export type CoderType = z.infer<typeof CoderSchema>

export const ParallelDevelopmentPlanSchema = z.object({
  folders: z.string().describe('folder structure'),
  todo: z.array(
    z.object({
      //
      task: z.string().describe('task'),
      codes: z.array(CoderSchema)
      //
    })
  )
  // tasks: z.discriminatedUnion('type', [webapp, commandLineTool]),
})

export type ParallelDevelopmentPlanSchemaType = z.infer<typeof ParallelDevelopmentPlanSchema>

export const runRecursive = async ({ checkAborted, onEvent, inbound, randID }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  const controller = new AbortController()
  const signal = controller.signal

  let run = async () => {
    const openai = new OpenAI({
      baseURL: inbound.baseURL,
      apiKey: inbound.apiKey
    })
    const isStream = true

    //  async (response) => {
    //     return JSON.parse(
    //       response.choices[0].message.content!
    //     ) as ParallelDevelopmentPlanSchemaType
    //   }
    // response_format: {
    //   type: 'json_schema',
    //   json_schema: {
    //     name: 'tree',
    //     schema: ParallelDevelopmentPlanSchema.toJSONSchema()
    //   }
    // },

    const plan = await openai.chat.completions
      .create(
        {
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `${inbound.appSystemPrompt}`
            },
            {
              role: 'user',
              content: `
                ${inbound.appUserPrompt}
              `
            }
          ],

          stream: isStream,
          reasoning_effort: 'high',
          temperature: 0.2
        },
        { signal }
      )
      .then(async (response) => {
        let text = ''
        for await (let event of response) {
          text += event.choices[0].delta.content || ''
          onEvent({ type: 'stream', stream: text })
        }
        return text
      })
      .catch((r) => {
        console.error(r)
        return null
      })

    //
    //
    //

    onEvent({
      type: 'plan',
      plan: plan
    })

    //
    //
    //
  }

  let tt = setInterval(() => {
    if (checkAborted()) {
      clearInterval(tt)
      controller.abort()
      return
    }
  })

  if (signal.aborted) {
    return
  }
  if (checkAborted()) {
    return
  }

  await run()

  //
}
