import { Agent } from '@mariozechner/pi-agent-core'
import { AllModels } from '../model'
import { readFileTool } from '../tool/readFileTool'
// import { getThinkingWords } from '../utils/getThinking'
// import { removeThinkTags } from '../utils/remoteThinking'
import { writeFileTool } from '../tool/writeFileTool'
import { listFilesTool } from '../tool/listFilesTool'

export const reviewAction = async ({
  todo,
  report,
  workspace,
  checkAborted,
  inbound,
  onEvent
}: any) => {
  //

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
      model: AllModels.find((r) => r.id === inbound.model)
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
Here's the report summary of the actions taken:
${report}

Instruction:
You only work at the workspace:  ${workspace}

You read: "todo.md" to understand context & todo 
You read: "action-result-summary.md" to understand actions taken

You review the current situation and write down the next step action in "next-step.md"
`)
}
