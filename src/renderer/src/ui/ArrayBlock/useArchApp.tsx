import { create } from 'zustand'
import { mindset } from './mindset'
import moment from 'moment'

export const useArchApp = create(() => {
  let getSeed = () => {
    let date = new Date()
    let ver = moment(date).format('YYYY-MM-DD')
    return `${[`${ver}`, Math.random().toString(36).slice(2, 9), `${mindset[Math.floor(Math.random() * mindset.length)]}`].join('--')}`
  }

  return {
    cmd_begin: '',
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],
    blocks: [] as any[],
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
    // qwen/qwen3-coder-30b // not work
    appModel: `qwen/qwen3.5-35b-a3b`,

    appName: 'transcript-gen',

    appUserPrompt: `
# I want to build a cli that can do the following:
- "help" command: documentation
- "download" command: ingest a list of youtube links separated by spaces

# I want to have a "skill.md" for ai agent to use this cli tool.

# I want to test the cli tool with the youtube link below:

https://www.youtube.com/watch?v=yyXwaUQOzlg
https://www.youtube.com/watch?v=W8GgMiCOVRo

# Overall Step for "download" command:
- download mp4 video and metadata json file from each youtube link.

- convert each .mp4 video to .wav audio

- transcribe .wav audio to "line by line transcript text" ".txt" file with timing & punctuation and "raw.json" file using "openai whisper" with auto mode for language detection (the audio should be in cantonese)

- Generate ".srt" caption file as well from the "raw.json"

- Create a "testimony" folder, within it, create sub-folder using "youtube video id" and "metadata-info.md" and put the "video", "audio" and "transcript" in it.

- open the folder for me when all are done.

    `.trim(),

    stream: '',
    thinking: '',
    terminalCalls: [],
    terminalWindow: ''
  }
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
