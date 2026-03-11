import { AgentTool } from '@mariozechner/pi-agent-core'
import { Type } from '@sinclair/typebox'
import * as fs from 'fs/promises'
// import { dirname } from 'path'

export const writeFileTool = ({ workspace }): AgentTool => {
  return {
    name: 'write_file',
    label: 'Write File', // For UI display
    description: "Write a file's contents",
    parameters: Type.Object({
      path: Type.String({ description: 'File path' }),
      content: Type.Any({ description: 'File content' })
    }),
    execute: async (toolCallId, params: any, signal, onUpdate) => {
      const content = params.content
      await fs.writeFile(params.path, params.content, 'utf-8')

      // Optional: stream progress
      onUpdate?.({
        content: [{ type: 'text', text: 'Writeing...' }],
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
