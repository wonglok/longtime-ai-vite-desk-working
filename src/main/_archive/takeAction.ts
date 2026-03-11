import { Agent } from '@mariozechner/pi-agent-core'
// import { AllModels } from '../model'
import { readFileTool } from './tool/readFileTool'
import { writeFileTool } from './tool/writeFileTool'
import { listFilesTool } from './tool/listFilesTool'
import { terminal_tool } from './tool/terminal_tool'
import { getModelByInbound } from './getModel'
import { work_schedule_tool } from './tool/work_schedule_tool'

export const takeAction = async ({ workspace, checkAborted, inbound, onEvent }: any) => {
  //
  const schedule = { scheduleWork: false }

  const agent = new Agent({
    initialState: {
      thinkingLevel: 'xhigh',
      tools: [
        //

        listFilesTool({ workspace: workspace }),
        readFileTool({ workspace: workspace }),
        writeFileTool({ workspace: workspace }),
        terminal_tool({ workspace: workspace }),

        work_schedule_tool({ schedule: schedule })
        //
      ],
      systemPrompt: `
You are an AI senior developer.

The current workspace is: ${workspace}
      `,
      model: getModelByInbound(inbound)
    },
    getApiKey: async () => {
      // provider
      return inbound.apiKey
    }
  })

  await agent.subscribe((evt) => {
    if (checkAborted()) {
      agent.abort()
    }

    if (evt.type === 'tool_execution_end') {
      console.log(evt.toolName, evt.result)
    }

    if (evt.type === 'message_update' && evt.assistantMessageEvent.type === 'text_delta') {
      let textContent = (evt.message.content[0] as { text: string }).text

      onEvent({
        type: 'side',
        text: textContent
      })
    }
  })

  await agent.prompt(`
Instruction:
You only work at the workspace:  ${workspace}

You read the "todo.md".
You choose 2-3 todos to work on.
You use "terminal_tool" to work on the chosen todos.
You update "todo.md" by checking the finished todos.

You schedule more work using "work_schedule_tool" if necessary.
`)

  return schedule
}
