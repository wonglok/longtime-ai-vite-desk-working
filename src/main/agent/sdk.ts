import OpenAI from 'openai'
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import { z } from 'zod'
// ============================================================================
// CORE TYPES & FACTORY
// ============================================================================

export type ToolResult = { success: boolean; data: any; error?: string }
export type ToolDef<T extends z.ZodObject<any>> = {
  name: string
  description: string
  schema: T
  execute: (args: z.infer<T>) => any
}

export const defineTool = <T extends z.ZodObject<any>>(def: ToolDef<T>) => def

// ============================================================================
// REGISTRY & CONVERSION
// ============================================================================

export const createToolKit = (tools: ToolDef<any>[]) => {
  const map = new Map(tools.map((t) => [t.name, t]))

  return {
    get schemas() {
      return tools.map((tool) => {
        const parameters = tool.schema.toJSONSchema()
        return {
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: parameters
          }
        }
      }) as ChatCompletionTool[]
    },

    run: async (name: string, args: any): Promise<ToolResult> => {
      const tool = map.get(name)
      if (!tool) return { success: false, data: null, error: `Unknown: ${name}` }

      const parsed = tool.schema.safeParse(args)
      if (!parsed.success) return { success: false, data: null, error: parsed.error.message }

      try {
        const data = await Promise.resolve(tool.execute(parsed.data))
        return { success: true, data }
      } catch (e) {
        return { success: false, data: null, error: String(e) }
      }
    }
  }
}

export const estimateTokenCountFromText = (thestring: string) =>
  Math.ceil(`${thestring}`.length / 4.5)

export const estimateTokenCountFromObject = (theobject: string) =>
  Math.ceil(`${JSON.stringify(theobject)}`.length / 4.5)

// ============================================================================
// AGENT
// ============================================================================

export const createAgent = async ({
  apiKey = '',
  baseURL = 'http://localhost:1234/v1',
  tools,
  model = 'qwen3.5-4b',
  temperature = 0.1,
  maxSteps = 20,
  contextWindow = 4096,
  onProgress = () => {}
}: {
  onProgress: (v) => void
  model: string
  temperature: number
  apiKey?: string
  baseURL?: string
  maxSteps?: number
  tools: ToolDef<any>[]
  contextWindow: number
}) => {
  const openai = new OpenAI({ apiKey, baseURL })
  const toolkit = createToolKit(tools)
  const messages: ChatCompletionMessageParam[] = []
  const maxIter = maxSteps
  const maxToken = contextWindow

  //
  //  console.log(maxToken)
  //

  return {
    executeProcedure: async (procedureText: string) => {
      // messages.push()

      console.log('\n🚀 Agent Loop\n' + '═'.repeat(30))

      for (let i = 0; i < maxIter; i++) {
        console.log('Step: ', i)
        const {
          choices: [{ message }]
        } = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: 'user', content: procedureText },
            //
            ...messages
          ],

          tools: toolkit.schemas,
          tool_choice: 'auto',
          temperature: temperature
        })

        messages.push(message)

        if (!message.tool_calls?.length) {
          console.log(`\n✅ Done:\n${message.content}`)
          console.log(`\n======== ✅ Done ========`)
          return { messages, output: messages[messages.length - 1]?.content }
        }

        console.log(`\n📍 Iter ${i + 1}: ${message.tool_calls.length} tool(s)`)

        for (const caller of message.tool_calls) {
          const id = caller.id
          const fn = caller['function']

          const result = await toolkit.run(fn.name, JSON.parse(fn.arguments))

          // console.log(fn.name, JSON.parse(fn.arguments), JSON.stringify(result, null, '\t'))

          onProgress(`${message.content}`)

          messages.push({ role: 'tool', tool_call_id: id, content: `${JSON.stringify(result)}` })
        }
      }

      return { messages, output: messages[messages.length - 1]?.content }
    }
  }
}

export function removeThinkTags(input) {
  const regex = /<think>.*?<\/think>/gis
  const result = input.replace(regex, '')
  return result
}
