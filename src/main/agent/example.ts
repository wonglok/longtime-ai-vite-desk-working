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

// ============================================================================
// USAGE
// ============================================================================

export const example = async () => {
  const docs = app.getPath('documents')
  const workspace = join(docs, `ai-home`)
  await makeDirectory(workspace)

  // const memory = await createMemoryAccessor({
  //   workspacePath: workspace
  // })

  const agent = await createAgent({
    apiKey: 'your-api-key',
    baseURL: 'http://localhost:1234/v1',
    temperature: 0.0,
    maxSteps: 999,
    // model: 'qwen3.5-4b', // local
    model: `m1-qwen3.5-35b-a3b`, // remote
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

  /*
  Calculate 2+2, write to "result.txt", then read it back then add 1 then save it then send it to me.
  get http://example.com and write to "example.html"
  */
  const files = await getAllFilesAsync(workspace, [])
  const filesText = `${files
    .map((r) => {
      return `${r}`
    })
    .join('\n')}`.trim()

  console.log(filesText)

  const result = await agent.run(`
    Here is the workspace: 
    ${workspace}

    Here are the files of the current folder:
    ${filesText}

    Task:
    can you build me a kanban todo app using vite, reactjs, tailwindcss, socket.io-client, express.js, localfile json database, support cross origin resource sharing for socket io and for express.
  
  `)

  console.log(result.output)

  //
  // console.log(result.output)
  //
}
