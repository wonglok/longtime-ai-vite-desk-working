import { create } from 'zustand'
// import { mindset } from './mindset'
import moment from 'moment'

const init = (set, get) => {
  let getSeed = () => {
    let date = new Date()
    let ver = moment(date).format('YYYY-MM-DD')
    let time = moment(date).format('HH-mm-(A)')
    // , `-${Math.random().toString(36).slice(2, 9)}`
    return `${[time, `${ver}`].join('-')}`
  }

  let newOne = `${getSeed()}`
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('seed')) {
      newOne = localStorage.getItem('seed')
    } else if (!localStorage.getItem('seed')) {
      localStorage.setItem('seed', getSeed())
      newOne = localStorage.getItem('seed')
    }
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
    refreshSeed: () => {
      localStorage.setItem('seed', getSeed())
      let newOne = localStorage.getItem('seed')
      set({
        seed: newOne
      })
    },
    getSeed: getSeed,
    seed: `${newOne}`,
    // baseURL: `http://127.0.0.1:7777/v1`,
    baseURL: `http://127.0.0.1:1234/v1`,
    apiKey: `nono`,

    // appModel: `Qwen3.5-4B-MLX-4bit`,
    // appModel: `qwen/qwen3.5-4b`,

    // google gemma 3 27b havent test (require too much ram)
    // google gemma 3 12b dont work
    // google gemma 3 4b dont work

    // appModel: `google/gemma-4-26b-a4b`,
    // qwen/qwen3.5-35b-a3b works well
    appModel: `qwen/qwen3.5-35b-a3b`,
    // appModel: `qwen/qwen3.5-122b-a10b`,
    // appModel: `qwen/qwen3.5-4b`,

    appName: 'transcript-gen',

    //     appUserPrompt: `
    // Build an bun ts script:

    // bun run ./prompt.ts --prompt "hi how are you?" --baseURL "http://localhost:1234" --apiKey "nono" --model "qwen/qwen3.5-4b"

    // // download metadata and youtube mp4 720p video, and thumbnail
    // bun run ./youtube.ts --url "https://www.youtube.com/watch?v=jxH3Jj6cCf8" --output "./output"

    // bun run ./convert-to-audio.ts --input "video.mp4" --output "./output/audio.wav"

    // bun run ./transcribe.ts --input "audio.wav" --output "./output/transcipt.txt"

    // bun run ./srt-caption-generator.ts --input "audio.wav" --output "./output/caption.srt"

    // `.trim(),

    appUserPrompt: `
Build an bun ts script:

bun run ./prompt.ts --prompt "hi how are you?" --baseURL "http://localhost:1234" --apiKey "my_key" --model "qwen/qwen3.5-35b-a3b"

`.trim()

    //     appUserPrompt: `
    // Build a script that uses LMStudio on localhost port 1234 with qwen/qwen3.5-4b model to process input text "bun run ./cli.ts --prompt 'i need Jesus in bible, please show me some scriptures'"
    //     `.trim(),
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
}
export const useArchApp = create<ReturnType<typeof init>>(init)

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
