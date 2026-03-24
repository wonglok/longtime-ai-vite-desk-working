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

    appName: 'image-gen',

    appUserPrompt: `
install for dependency
\`\`\`bash
pip install git+https://github.com/huggingface/diffusers
\`\`\`

Template for python
\`\`\`python
import torch
from diffusers import ZImagePipeline

# 1. Load the pipeline
# Use bfloat16 for optimal performance on supported GPUs
pipe = ZImagePipeline.from_pretrained(
    "Tongyi-MAI/Z-Image-Turbo",
    torch_dtype=torch.bfloat16,
    low_cpu_mem_usage=False,
)
pipe.to("mps")

# [Optional] Attention Backend
# Diffusers uses SDPA by default. Switch to Flash Attention for better efficiency if supported:
# pipe.transformer.set_attention_backend("flash")    # Enable Flash-Attention-2
# pipe.transformer.set_attention_backend("_flash_3") # Enable Flash-Attention-3

# [Optional] Model Compilation
# Compiling the DiT model accelerates inference, but the first run will take longer to compile.
# pipe.transformer.compile()

# [Optional] CPU Offloading
# Enable CPU offloading for memory-constrained devices.
# pipe.enable_model_cpu_offload()

prompt = "Young Chinese woman in red Hanfu, intricate embroidery. Impeccable makeup, red floral forehead pattern. Elaborate high bun, golden phoenix headdress, red flowers, beads. Holds round folding fan with lady, trees, bird. Neon lightning-bolt lamp (⚡️), bright yellow glow, above extended left palm. Soft-lit outdoor night background, silhouetted tiered pagoda (西安大雁塔), blurred colorful distant lights."

# 2. Generate Image
image = pipe(
    prompt=prompt,
    height=1024,
    width=1024,
    num_inference_steps=9,  # This actually results in 8 DiT forwards
    guidance_scale=0.0,     # Guidance should be 0 for the Turbo models
    generator=torch.Generator("mps").manual_seed(42),
).images[0]

image.save("example.png")
\`\`\`


I want to build a cli tool to generate image using "z-image-turbo".

Please also build a "skill.md"

Please use the cli tool to generate an image of "an apple" and open it.

`.trim(),

    //     appUserPrompt: `
    // - Here's a list of youtube links in multiple rows:

    // https://www.youtube.com/watch?v=yyXwaUQOzlg
    // https://www.youtube.com/watch?v=W8GgMiCOVRo

    // I want to build a cli that can do the following:
    // - "help" command: documentation
    // - "download" command: ingest a list of youtube links seperated by spaces

    // I want to have a skill.md for ai agent to use this cli tool.

    // # Overall Step for "donwload" command:
    // - download mp4 video and metadata json file from each youtube link.

    // - convert each .mp4 video to .wav audio

    // - transcribe .wav audio to "line by line transcript text" ".txt" file with timing & punctuation and "raw.json" file using "openai whisper" with auto mode for language detection

    // - Generate ".srt" caption file as well from the "raw.json"

    // - Create a "testimony" folder, within it, create sub-folder using "youtube video id" and "metadata-info.md" and put the "video", "audio" and "transcript" in it.

    // - open the folder for me when all are done.

    // `.trim(),

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
