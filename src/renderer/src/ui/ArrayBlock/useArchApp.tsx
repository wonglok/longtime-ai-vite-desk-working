import { create } from 'zustand'

export const useArchApp = create(() => {
  return {
    //
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],
    blocks: [] as any[],
    done: '',

    appModel: `qwen/qwen3.5-4b`,

    appName: 'web-analyser',

    appUserPrompt: `
Tool should receive an "website url" input and return a "hello world and the webiste's title" as well as take a full-page screenshot
    `.trim(),

    // appModel: `qwen/qwen3.5-35b-a3b`,

    stream: '',
    thinking: '',
    terminalCalls: [],
    terminalWindow: ''
  }
})

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

//     appUserPrompt: `
// The tool should be able to receive input of a website url,
// then the tool can spin up a browser to take a fullpage screenshot,
// make a thumbnail and collect some essential text from the webpage.
// and then it will send to AI to generate inspirational notes.
// Use lmstudio and pick "qwen/qwen3.5-4b" AI model as default AI
//     `.trim(),
