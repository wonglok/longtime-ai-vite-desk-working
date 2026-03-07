import { Model } from '@mariozechner/pi-ai'

export const getModelByInbound = (inbound): Model<'openai-completions'> => {
  return {
    id: inbound.model,
    name: inbound.model,
    api: 'openai-completions',
    provider: 'lmstudio',
    baseUrl: inbound.baseURL,
    reasoning: true,
    input: ['text', 'image'],
    cost: { input: 2.5, output: 10, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 32000,
    compat: {
      supportsStore: false // LiteLLM doesn't support the store field
    }
  }
}
