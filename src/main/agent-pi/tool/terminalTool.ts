import { AgentTool } from '@mariozechner/pi-agent-core'
import { Type } from '@sinclair/typebox'
import { exec } from 'child_process'

export const terminalTool = ({ workspace }): AgentTool => {
  return {
    name: 'terminal_tool',
    label: 'Terminal tool', // For UI display
    description: 'Terminal tool for ai to run command',
    parameters: Type.Object({
      command: Type.String({ description: 'terminal command' })
    }),
    execute: async (toolCallId, params: any, signal, onUpdate) => {
      //

      const result = await new Promise((resolve, reject) => {
        exec(`${params.command}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            reject(`exec error: ${error}`)
            return
          }

          // if (stderr) {
          //   console.info(`${stderr}`)
          //   // reject(`std error: ${stderr}`)
          // }

          onUpdate?.({
            content: [{ type: 'text', text: stdout }],
            details: {
              text: stdout
            }
          })

          console.log('cmd: ', params.command)
          console.log(`${stdout}`)
          resolve(stdout)
        })
      })

      // Optional: stream progress

      return {
        content: [{ type: 'text', text: `${JSON.stringify(result)}` }],
        details: { command: `${params.command}`, size: 0 }
      }
    }
  }
}

//

//
