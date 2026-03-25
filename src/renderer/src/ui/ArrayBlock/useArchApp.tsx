import { create } from 'zustand'
import { mindset } from './mindset'
import moment from 'moment'

export const useArchApp = create(() => {
  let getSeed = () => {
    let date = new Date()
    let ver = moment(date).format('YYYY-MM-DD')
    let time = moment(date).format('hh-mm-A')
    // , `-${Math.random().toString(36).slice(2, 9)}`
    return `${[time, `${ver}`].join('-')}`
  }

  return {
    cmd_begin: '',
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],
    blocks: [] as any[],
    terminalCalls: [],
    stream: '',
    thinking: '',
    terminalWindow: '',

    done: '',

    getSeed: getSeed,
    seed: `${getSeed()}`,
    // baseURL: `http://127.0.0.1:7777/v1`,
    baseURL: `http://127.0.0.1:1234/v1`,
    apiKey: `nono`,

    // appModel: `Qwen3.5-4B-MLX-4bit`,
    // appModel: `qwen/qwen3.5-4b`,

    // google gemma 3 27b havent test (require too much ram)
    // google gemma 3 12b dont work
    // google gemma 3 4b dont work

    // qwen/qwen3.5-35b-a3b works well
    appModel: `qwen/qwen3.5-35b-a3b`,

    appName: 'transcript-gen',

    appUserPrompt: `
# Build a bun script:
  $ bun run ./script.ts --download https://www.youtube.com/watch?v=D3yMC_qoAes --output ./my-info/
    - it downloads mp4 video and metadata from each youtube link, use ID from link for video's name
    `.trim()
  }
  /*
  
  $ bun run ./cli.ts --convert ./my-info/video.mp4 --output ./my-info/
  - convert each .mp4 video to .wav audio 

  $ bun run ./cli.ts --transcribe ./my-info/audio.wav --output ./my-info/
  - transcribe .wav audio to "line by line transcript text" ".txt" file with timing & punctuation and "raw.json" file using "@huggingface/transformers"
  - Generate ".srt" caption file as well from the "raw.json"

  $ bun run ./cli.ts --open ./my-info
  - open the folder for me when all are done.
  
  */
  //
  //
  //

  //
  // # Write a "skill.md" for ai agent to use this cli tool, must include examples
  //
})

/*

- translate the transcript text to english using "openai" sdk
  openAI config baseURL: http://127.0.0.1:1234/v1
  openAI config apiKey: nono
  openAI config model: qwen/qwen3.5-35b-a3b

*/

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
