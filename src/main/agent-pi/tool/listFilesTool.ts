import { AgentTool } from '@mariozechner/pi-agent-core'
import { Type } from '@sinclair/typebox'
import * as fs from 'fs/promises'
import { dirname, join } from 'path'

export const listFilesTool = ({ workspace }): AgentTool => {
  return {
    name: 'list_files',
    label: 'List Files', // For UI display
    description: 'List a files names',
    parameters: Type.Object({
      path: Type.String({ description: 'File path' })
    }),
    execute: async (toolCallId, params: any, signal, onUpdate) => {
      let items = await recursiveReadDir(params.path)

      let filtered = items
        .filter((r) => {
          if (r.path.includes('node_modules')) {
            return false
          }
          return true
        })
        .filter((r) => {
          if (r.path.includes('.git')) {
            return false
          }
          return true
        })

      const content = `${filtered.map((r) => `[${r.type}]: ${r.path}`).join('\n')}`

      // const content = await fs.readFile(params.path, 'utf-8')

      // // Optional: stream progress
      // onUpdate?.({
      //   content: [{ type: 'text', text: 'Reading...' }],
      //   details: {
      //     text: content
      //   }
      // })

      return {
        content: [{ type: 'text', text: content }],
        details: { path: params.path, size: filtered.length }
      }
    }
  }
}

//

//
async function recursiveReadDir(dirPath) {
  let files: any[] = []
  // Read the directory contents with file types for efficiency
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push({
        path: fullPath,
        type: 'folder'
      })

      // If it's a directory, recurse into it and add its files to the list
      files = files.concat(await recursiveReadDir(fullPath))
    } else {
      // If it's a file, add its full path to the list
      files.push({
        path: fullPath,
        type: 'file'
      })
    }
  }

  return files
}
