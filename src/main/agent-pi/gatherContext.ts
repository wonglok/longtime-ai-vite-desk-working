import { Agent } from '@mariozechner/pi-agent-core'
import { AllModels } from '../model'
import { readFileTool } from './tool/readFileTool'

export const gatherContext = async ({ inbound, onEvent }: any) => {
  const agent = new Agent({
    initialState: {
      thinkingLevel: 'xhigh',
      tools: [
        //
        readFileTool({ workspace: inbound.workspace })
      ],
      systemPrompt: `You are a personal AI Assistant.`,
      model: AllModels.find((r) => r.id === 'qwen/qwen3.5-9b')
    },
    getApiKey: async (provider) => {
      return 'abc'
    }
  })

  let clean = await agent.subscribe((evt) => {
    if (evt.type === 'message_update' && evt.assistantMessageEvent.type === 'thinking_delta') {
      let textContent = (evt.message.content[0] as { text: string }).text
      console.log(textContent)

      onEvent({
        type: 'think',
        text: textContent
      })
    }
  })

  //
  //

  await agent.prompt(inbound.appSpec)

  clean()

  const finalMessage = agent.state.messages[agent.state.messages.length - 1]

  const textContent = (finalMessage.content[0] as { text: string }).text

  return textContent
}

//

//
//
//
