import OpenAI from 'openai'
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import { z } from 'zod'
import * as path from 'path'
import * as fs from 'fs/promises'
import { TaskManager } from './toolbox'

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
  instructions = '',
  workspace = '',
  apiKey = '',
  baseURL = 'http://localhost:1234/v1',
  tools,
  model = 'qwen3.5-4b',
  temperature = 0.1,
  contextWindow = 4096,
  onProgress = () => {}
}: {
  instructions: string
  workspace: string
  onProgress: (v) => void
  model: string
  temperature: number
  apiKey?: string
  baseURL?: string
  tools: ToolDef<any>[]
  contextWindow: number
}) => {
  const openai = new OpenAI({ apiKey, baseURL })
  const toolkit = createToolKit(tools)
  const toolMessages: ChatCompletionMessageParam[] = []
  const maxToken = contextWindow

  //
  //  console.log(maxToken)
  //

  return {
    executeProcedure: async ({ taskManager }: { taskManager: TaskManager }) => {
      //
      // if (toolMessages.length === 0) {
      //   toolMessages.push({
      //     role: 'user',
      //     content: 'continue task'
      //   })
      // }
      //
      console.log('\n🚀 Agent Loop\n' + '═'.repeat(30))
      let progressText = ''
      let i = 0
      let run = async () => {
        console.log('Running Step: ', i)

        i++

        // const files = await getAllFilesAsync(workspace, [])
        //       const filesListText = `
        // Here are the files in the current workspace:
        //   ${files
        //     .filter((r) => {
        //       if (r.includes('node_modules')) {
        //         return false
        //       }
        //       return true
        //     })
        //     .map((r) => {
        //       return `${r}`
        //     })
        //     .join('\n')}`.trim()

        let todo = ``
        if (taskManager.todo) {
          todo = `${taskManager.todo}`
        }
        const contextMessages: ChatCompletionMessageParam[] = [
          //
          {
            role: 'system',
            content: `
you are an AI senior developer.
              `
          },
          {
            role: 'user',
            content: `
You are in this workspace folder:
${workspace}

${instructions}

${todo}

              `
          }
        ]

        console.log(contextMessages)

        const {
          choices: [{ message }]
        }: any = await openai.chat.completions.create({
          model: model,
          messages: [
            ...contextMessages,
            ...toolMessages
              .slice()
              .reverse()
              .filter((_, idx) => {
                if (idx < 4) {
                  return true
                }
                return false
              })
              .reverse()
          ],

          tools: toolkit.schemas,
          tool_choice: 'required',
          temperature: temperature,
          reasoning_effort: 'high'
        })

        toolMessages.push(message)

        if (message?.tool_calls?.length > 0) {
          // return { toolMessages, output: toolMessages[toolMessages.length - 1]?.content }
          console.log(`\n📍 Iter ${i + 1}: ${message.tool_calls.length} tool(s)`)

          try {
            for (const caller of message.tool_calls) {
              const id = caller.id
              const fn = caller['function']

              const result = await toolkit.run(fn.name, JSON.parse(fn.arguments))

              if (fn.name === 'terminal_tool') {
                progressText = `Thinking:\n${removeThinkTags(message.content)}\n${'(bash)$ '} ${JSON.parse(fn.arguments).cmd}\n${result.data}\n`
                onProgress(progressText)
              }

              if (fn.name === 'task_manager_tool') {
                let args = JSON.parse(fn.arguments)
                progressText = `Thinking:\n${removeThinkTags(message.content)}\nTodo List:\n${args.latestTodos}\nNext Step: \n${args.nextStep}\n${result.data}\n`
                onProgress(progressText)
              }

              toolMessages.push({
                role: 'tool',
                tool_call_id: id,
                content: `Tool Result: ${JSON.stringify(result)}`
              })
            }
          } catch (e) {
            console.error(e)
          }

          return await run()
        } else {
          //
          if (taskManager.appIsFullyBuilt) {
          } else {
            return await run()
          }
        }
      }
      await run()

      return { toolMessages, output: toolMessages[toolMessages.length - 1]?.content }
    }
  }
}

export function removeThinkTags(input) {
  const regex = /<think>.*?<\/think>/gis
  const result = input.replace(regex, '').trim()
  return result
}

/**
 * Recursively list all files in a directory and its subdirectories.
 * @param {string} dirPath The absolute or relative path to the directory.
 * @param {string[]} [fileList] An optional array to accumulate file paths.
 * @returns {string[]} An array of absolute file paths.
 */
export const getAllFilesAsync = async (dirPath, fileList: string[] = []) => {
  // Read the contents of the current directory
  const files = await fs.readdir(dirPath)

  for (let file of files) {
    // Construct the full path to the current item
    const fullPath = path.join(dirPath, file)

    // Check if the item is a directory
    if ((await fs.stat(fullPath)).isDirectory()) {
      // If it's a directory, recursively call the function
      await getAllFilesAsync(fullPath, fileList)
    } else {
      // If it's a file, add its full path to the list
      fileList.push(fullPath)
    }
  }

  // files.forEach(async (file) => {
  // })

  return fileList
}
