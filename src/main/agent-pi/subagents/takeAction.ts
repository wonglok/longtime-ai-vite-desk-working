import { Agent } from '@mariozechner/pi-agent-core'
import { AllModels } from '../../model'
import { readFileTool } from '../tool/readFileTool'
import { writeFileTool } from '../tool/writeFileTool'
import { listFilesTool } from '../tool/listFilesTool'

export const takeAction = async ({ context, workspace, checkAborted, inbound, onEvent }: any) => {
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
      model: AllModels.find((r) => r.id === 'qwen/qwen3.5-9b')
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

      // if (textContent.includes(`<think>`)) {
      //   onEvent({
      //     type: 'think',
      //     text: getThinkingWords(textContent).replace(`<think>`, ``)
      //   })
      // } else {

      // }

      // if (textContent.includes(`</think>`)) {
      //   onEvent({
      //     type: 'workbox',
      //     text: removeThinkTags(textContent)
      //   })
      // } else {
      //   onEvent({
      //     type: 'workbox',
      //     text: ''
      //   })
      // }
    }
  })

  await agent.prompt(`
Here's the context of the tasks:
${context}


Instruction:
You only work at the workspace:  ${workspace}

You follow to todo list in the context.

You read the "todo.md".
You update all the finished tasks and write to "todo.md".

You finally write the action result summary to "action-result-summary.md".
`)
}
