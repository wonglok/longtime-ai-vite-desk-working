import { createAgent } from './sdk'
import {
  calculate,
  createMemoryAccessor,
  fetchTool,
  getAllFilesAsync,
  readFile,
  terminalTool,
  writeFile
} from './toolbox'
import { join } from 'path'
import { app } from 'electron'
import { makeDirectory } from 'make-dir'
// @ts-ignore
import metaprompt from './meta-prompt.md?raw'
import { generateJSON, streamText } from './simple-ai-calls'

//
// const dirTool = prepToolListFiles({ workspace: inbound.workspace })
// const refined = await generateJSON({
//   api: inbound,
//   temperature: 0,
//   reasoning: {
//     effort: 'high'
//   },
//   messages: [
//     {
//       role: 'system',
//       content: `
//       You are an AI senior developer, you refine prompt and write overall context for AI agents to use.
//       Current file tree:
//       ${await dirTool.execute({ relativePath: './' })}
//     `
//     },
//     {
//       role: 'user',
//       content: `${inbound.prompt}`
//     }
//   ],
//   schema: z.object({
//     context: z.string()
//   })
// })
// mainWindow.webContents.send(
//   `askAI-stream${randID}`,
//   `Todo list: \n ${JSON.stringify(refined, null, '\t')}`
// )

// ============================================================================
// USAGE
// ============================================================================

export const enhancedAgent = async ({ mainWindow, event, randID, inbound, inputPrompt }) => {
  const docs = app.getPath('documents')
  const workspace = join(docs, `ai-home/my-app-01`)
  await makeDirectory(workspace)

  // const memory = await createMemoryAccessor({
  //   workspacePath: workspace
  // })

  const refined = await streamText({
    api: inbound,
    temperature: 0,
    reasoning: {
      effort: 'high'
    },
    messages: [
      {
        role: 'system',
        content: `
          ${metaprompt}
        `
      },
      {
        role: 'user',
        content: `${inputPrompt}`
      }
    ],
    onStream: (v) => {
      mainWindow.webContents.send(`askAI-stream${randID}`, v)
    }
  })

  const agent = await createAgent({
    apiKey: 'your-api-key',
    baseURL: 'http://localhost:1234/v1',
    temperature: 0.0,
    maxSteps: 999,
    model: 'qwen3.5-9b', // local
    // model: `m1-qwen3.5-35b-a3b`, // remote
    contextWindow: 4096,
    tools: [
      //
      terminalTool(),
      fetchTool
      // calculate
      // readFile(memory),
      // writeFile(memory)
    ]
  })

  const files = await getAllFilesAsync(workspace, [])
  const filesText = `${files
    .filter((r) => {
      if (r.includes('node_modules')) {
        return false
      }
      return true
    })
    .map((r) => {
      return `${r}`
    })
    .join('\n')}`.trim()

  console.log(filesText)

  const result = await agent.executeProcedure(`
    Here are the files of the current folder:
    ${filesText}

    Here is the workspace: 
    ${workspace}

    ${refined}
  `)

  /*
  Calculate 2+2, write to "result.txt", then read it back then add 1 then save it then send it to me.
  get http://example.com and write to "example.html"
  */

  console.log(result.output)

  //
  // console.log(result.output)
  //
}
