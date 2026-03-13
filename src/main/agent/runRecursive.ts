import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import OpenAI from 'openai'
import z from 'zod'

export const AICoderContextSchema = z
  .object({
    _id: z.uuid().describe('random-id-for-unique-object-id'),
    filePath: z.string().describe('file path ./'),
    systemPrompt: z
      .string()
      .describe(
        'AI agent context: system prompt message for the code to be written, please also add thouht of the agent for that task'
      ),
    userPrompt: z
      .string()
      .describe(
        'AI agent context: user message for the code file to be written, please also add thouht of the agent for that task'
      )
  })
  .describe('a development plan for AI Coding Agent to generate that code file')

export type AICoderContextType = z.infer<typeof AICoderContextSchema>

const webapp = z
  .object({
    type: z.literal('personal_webapp').describe('personal small webapp'),
    description: z.literal(
      'you are a professional nextjs developer. you use file based json databas and sub-folder for other files.'
    ),
    codes: z.object({
      frontend: z.object({
        pages: z.array(AICoderContextSchema).describe('nextjs app rotuer frontend pages'),
        components: z.array(AICoderContextSchema).describe('frontend react components'),
        hooks: z.array(AICoderContextSchema).describe('frontend react hooks'),
        clients: z.array(AICoderContextSchema).describe('frontend api client')
      }),

      backend: z.object({
        endpoints: z
          .array(AICoderContextSchema)
          .describe('api endpoints. Nextjs App router API Routes'),
        database: z
          .array(AICoderContextSchema)
          .describe('local json database modules using "db-local" npm package')
      }),

      global: z.object({
        apiConfigData: z.array(AICoderContextSchema).describe('configuration data'),
        typeFiles: z
          .array(AICoderContextSchema)
          .describe('typescript type of all data used with naming conventions')
      })
    })
  })
  .describe(
    'small personal web app uses "nextjs" with file based json database and sub-folder for other files.'
  )

const commandLineTool = z
  .object({
    type: z.literal('cli_tool').describe('command line tool'),
    code: z.object({
      tool: z.object({
        code: z.array(AICoderContextSchema).describe('command line entry point code'),
        database: z
          .array(AICoderContextSchema)
          .describe('backend local json database modules using "db-local" npm package')
      }),

      global: z.object({
        apiConfigData: z.array(AICoderContextSchema).describe('configuration data')
      })
    })
  })
  .describe(
    'cli tool uses "meow" npm package with file based json database and sub-folder for other files.'
  )

export const ParallelDevelopmentPlanSchema = z.discriminatedUnion('type', [webapp, commandLineTool])

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
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'tree',
              schema: ParallelDevelopmentPlanSchema.toJSONSchema()
            }
          },
          reasoning_effort: 'none',
          temperature: 0
        },
        { signal }
      )
      .then(async (response) => {
        return JSON.parse(response.choices[0].message.content!) as ParallelDevelopmentPlanSchemaType
      })
      .catch((r) => {
        console.error(r)
        return null
      })

    onEvent({
      type: 'plan',
      plan: plan
    })
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
