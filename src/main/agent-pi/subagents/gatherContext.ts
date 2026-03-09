import { Agent } from '@mariozechner/pi-agent-core'
// import { AllModels } from '../model'
import { readFileTool } from '../tool/readFileTool'
import { writeFileTool } from '../tool/writeFileTool'
import { listFilesTool } from '../tool/listFilesTool'
import { getModelByInbound } from '../utils/getModel'

export const gatherContext = async ({ workspace, checkAborted, inbound, onEvent }: any) => {
  const agent = new Agent({
    initialState: {
      thinkingLevel: 'xhigh',
      tools: [
        //
        listFilesTool({ workspace: workspace }),
        readFileTool({ workspace: workspace }),
        writeFileTool({ workspace: workspace })
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
${inbound.appSpec}

Instruction:
You only work at the workspace:  ${workspace}

You read "todo.md"
You gather related context information in the workspace.

You output a todo list, and write to "todo.md"
`)
}
