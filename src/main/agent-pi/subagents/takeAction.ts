import { Agent } from '@mariozechner/pi-agent-core'
// import { AllModels } from '../model'
import { readFileTool } from '../tool/readFileTool'
import { writeFileTool } from '../tool/writeFileTool'
import { listFilesTool } from '../tool/listFilesTool'
import { terminalTool } from '../tool/terminalTool'
import { getModelByInbound } from '../utils/getModel'
import { workScheduleTool } from '../tool/workScheduleTool'

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
        terminalTool({ workspace: workspace }),

        workScheduleTool({ schedule: schedule })
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

You use terminal tool and work on the todo list
You always use npm install to install modules

You update all the finished tasks and write to "todo.md".

Finally, you schedule more work using "work_schedule_tool".
`)

  return schedule
}
