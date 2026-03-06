import { AgentTool } from '@mariozechner/pi-agent-core'
import { Type } from '@sinclair/typebox'
import * as fs from 'fs/promises'
import { dirname } from 'path'

export const readFileTool = ({ workspace }): AgentTool => {
  return {
    name: 'read_file',
    label: 'Read File', // For UI display
    description: "Read a file's contents",
    parameters: Type.Object({
      path: Type.String({ description: 'File path' })
    }),
    execute: async (toolCallId, params: any, signal, onUpdate) => {
      const content = await fs.readFile(params.path, 'utf-8')

      // Optional: stream progress
      onUpdate?.({
        content: [{ type: 'text', text: 'Reading...' }],
        details: {
          text: content
        }
      })

      return {
        content: [{ type: 'text', text: content }],
        details: { path: params.path, size: content.length }
      }
    }
  }
}

//

//
