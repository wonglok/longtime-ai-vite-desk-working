import { Model } from '@mariozechner/pi-ai'

// Example: LiteLLM proxy with explicit compat settings
export const Qwen3_5_Model_9b: Model<'openai-completions'> = {
  id: 'qwen/qwen3.5-9b',
  name: 'Qwen3.5-9b',
  api: 'openai-completions',
  provider: 'lmstudio',
  baseUrl: 'http://localhost:1234/v1',
  reasoning: true,
  input: ['text', 'image'],
  cost: { input: 2.5, output: 10, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 128000,
  maxTokens: 32000,
  compat: {
    supportsStore: false // LiteLLM doesn't support the store field
  }
}

// Example: LiteLLM proxy with explicit compat settings
export const Qwen3_5_Model_4b: Model<'openai-completions'> = {
  id: 'qwen3.5-4b',
  name: 'Qwen3.5-4b',
  api: 'openai-completions',
  provider: 'lmstudio',
  baseUrl: 'http://localhost:1234/v1',
  reasoning: true,
  input: ['text', 'image'],
  cost: { input: 2.5, output: 10, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 128000,
  maxTokens: 32000,
  compat: {
    supportsStore: false // LiteLLM doesn't support the store field
  }
}

export const AllModels: Model<'openai-completions'>[] = [
  //
  Qwen3_5_Model_9b,
  Qwen3_5_Model_4b
]
