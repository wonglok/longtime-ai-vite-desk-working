import { create } from 'zustand'
import { mindset } from './mindset'

export const useArchApp = create(() => {
  return {
    //
    cmd_begin: '',
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],
    blocks: [] as any[],
    done: '',

    //
    getSeed: () => {
      return `${[`[${Math.random().toString(35).slice(2, 9)}]`, `${mindset[Math.floor(Math.random() * mindset.length)]}`].join('-')}`
    },
    seed: `${[`[${Math.random().toString(35).slice(2, 9)}]`, `${mindset[Math.floor(Math.random() * mindset.length)]}`].join('-')}`,
    // baseURL: `http://127.0.0.1:7777/v1`,
    baseURL: `http://127.0.0.1:1234/v1`,
    apiKey: `nono`,

    //
    // appModel: `Qwen3.5-4B-MLX-4bit`,
    appModel: `qwen/qwen3.5-4b`,

    appName: 'goal-achiever',

    // Tool should receive an "website url" input and take a full-page screenshot and write a website summary with the website text and screenshot
    appUserPrompt: `
Please download mp4 video from youtube link: 
https://www.youtube.com/watch?v=XVsf_2UMXwU
https://www.youtube.com/watch?v=yyXwaUQOzlg
and put it into a ouput folder for me and open the folder for me when all done.
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
