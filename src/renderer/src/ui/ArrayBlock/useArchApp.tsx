import { create } from 'zustand'

export const useArchApp = create(() => {
  return {
    //
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],
    done: '',

    // appUserPrompt: `
    // I want to build an inspiration tool.

    // For home page "/":
    //   - I can view featured inspirations

    // For app page "/inspire":
    //   - I can enter a website URL to the inspiration entry box to "save inspiration".
    //   - When I click "save inspiration" button, we spin up a browser to take a fullpage screenshot, make a thumbnail and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-4b" AI model

    // For each inspiration post page "/inspire/[id]":
    // i can view inspiration items in the grid below the entry box.
    // - There's a thumbnail header
    // - Website name
    // - Textual Analysis
    // `.trim(),

    appModel: `qwen/qwen3.5-4b`,

    appName: 'inspire-world',
    appUserPrompt: `
I want to build a cli tool.

I want the tool to be able to receive input of a website address, then the tool can spin up a browser to take a fullpage screenshot, make a thumbnail and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-4b" AI model

Please write a skill.md for my AI agent to use it.
`.trim(),

    // appModel: `qwen/qwen3.5-35b-a3b`,

    stream: '',
    terminalCalls: [],
    terminalWindow: ''
  }
})
