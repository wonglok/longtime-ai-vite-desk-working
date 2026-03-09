import { AgentTool } from '@mariozechner/pi-agent-core'
import { Type } from '@sinclair/typebox'

export const work_schedule_tool = ({ schedule }): AgentTool => {
  return {
    name: 'work_schedule_tool',
    label: 'a tool for scheduling more work', // For UI display
    description: 'a tool for scheduling more work',
    parameters: Type.Object({
      scheduleWork: Type.Boolean({ description: 'Scheulde more work' })
    }),
    execute: async (toolCallId, params: any, signal, onUpdate) => {
      // const content = await fs.readFile(params.path, 'utf-8')

      // // Optional: stream progress
      // onUpdate?.({
      //   content: [{ type: 'text', text: 'Reading...' }],
      //   details: {
      //     text: content
      //   }
      // })

      schedule.scheduleWork = params.scheduleWork

      return {
        content: [{ type: 'text', text: params.scheduleWork }],
        details: { path: params.path, size: 1 }
      }
    }
  }
}

//

//
