import { makeDirectory } from 'make-dir'
import { join } from 'path'
import { success, z } from 'zod'
import * as path from 'path'
import * as fs from 'fs/promises'
import { defineTool } from './sdk'
import { exec } from 'child_process'

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export type TaskManager = {
  todo: string
  // nextStep: string
  appIsFullyBuilt: boolean
}

export const taskManagerTool = ({
  taskManager = { todo: '', appIsFullyBuilt: false }
}: {
  taskManager: TaskManager
}) =>
  defineTool({
    name: 'task_manager_tool',
    description:
      'this task manager tool can update the todo list with current task and any necessary sub task',
    schema: z.object({
      appIsFullyBuilt: z.boolean().describe('when the app is fully built'),
      latestTodos: z
        .string()
        .describe(
          'this task manager tool can update the todo list with current task and any necessary sub task'
        )
    }),
    execute: async ({ latestTodos, appIsFullyBuilt }) => {
      return new Promise((resolve, reject) => {
        taskManager.todo = latestTodos
        taskManager.appIsFullyBuilt = appIsFullyBuilt

        resolve(`${JSON.stringify({ status: 'successfully updated todo' })}`)
      })
    }
  })

export const terminalTool = () =>
  defineTool({
    name: 'terminal_tool',
    description: 'terminal tool',
    schema: z.object({ cmd: z.string() }),
    execute: async ({ cmd }) => {
      return new Promise((resolve, reject) => {
        exec(`${cmd}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            reject(`exec error: ${error}`)
            return
          }

          // if (stderr) {
          //   console.info(`${stderr}`)
          //   // reject(`std error: ${stderr}`)
          // }
          console.log('cmd: ', cmd)
          console.log(`${stdout}`)
          resolve(stdout)
        })
      })
    }
  })

export const fetchTool = defineTool({
  name: 'fetch_tool',
  description: 'fetch tool',
  schema: z.object({ url: z.string() }),
  execute: async ({ url }) => {
    return new Promise((resolve, reject) => {
      exec(`curl ${new URL(url).href}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          reject(`exec error: ${error}`)
          return
        }

        // if (stderr) {
        //   console.error(`stderr: ${stderr}`)
        //   reject(`std error: ${stderr}`)
        //   return
        // }

        console.log(`stdout: ${stdout}`)
        resolve(`${stdout}`)
      })
    })
  }
})

export const calculate = defineTool({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  schema: z.object({ expression: z.string() }),
  execute: ({ expression }) => {
    return new Function('return ' + expression)()
  }
})

export const createMemoryAccessor = async ({
  workspacePath
}): Promise<{
  get: (key: string) => Promise<any>
  set: (key: string, val: any) => Promise<any>
}> => {
  //

  const basePath = path.dirname(join(workspacePath))
  await makeDirectory(basePath)

  async function writeFileAutoCreateFolder(filePath, content) {
    try {
      const dirName = path.dirname(filePath)

      await fs.mkdir(dirName, { recursive: true })

      await fs.writeFile(filePath, content)
      console.log(`File written successfully to: ${filePath}`)
    } catch (err) {
      console.error('Error writing file:', err)
    }
  }

  return {
    async get(key) {
      const fullPath = join(workspacePath, key)
      const folder = path.dirname(fullPath)
      await makeDirectory(folder)

      return fs.readFile(fullPath).catch((r) => {
        console.error(r)
        return ''
      })
    },
    async set(key, val) {
      const fullPath = join(workspacePath, key)
      await writeFileAutoCreateFolder(fullPath, val)
    }
  }
}

export type MemoryAccessor = Awaited<ReturnType<typeof createMemoryAccessor>>

export const readFileTool = (memory: MemoryAccessor) =>
  defineTool({
    name: 'read_file',
    description: 'Read contents of a file',
    schema: z.object({ path: z.string() }),
    execute: async ({ path }) => {
      return `${await memory.get(path)}` || `// File ${path} not found`
    }
  })

export const writeFileTool = (memory: MemoryAccessor) =>
  defineTool({
    name: 'write_file',
    description: 'Write content to a file',
    schema: z.object({ path: z.string(), content: z.string().or(z.number()) }),
    execute: async ({ path, content }) => {
      await memory.set(path, `${content}`)
      return `Wrote ${`${content}`.length} bytes to ${path}`
    }
  })

//
