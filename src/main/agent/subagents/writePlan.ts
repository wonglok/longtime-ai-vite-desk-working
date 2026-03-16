import OpenAI from 'openai'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { makeDirectory } from 'make-dir'

export async function writePlan({ workspace, inbound, checkAborted, onEvent }) {
  await makeDirectory(join(workspace, 'ai-memory'))

  let whichPlan = ''

  try {
    const oldPlan = await readFile(join(workspace, 'ai-memory', 'system-plan.md'), 'utf8').catch(
      () => {
        throw new Error('no old plan found')
      }
    )
    const appIdea = await readFile(join(workspace, 'ai-memory', 'app-idea.md'), 'utf8').catch(
      () => {
        throw new Error('no app idea found')
      }
    )

    if (appIdea === inbound.appUserPrompt.trim()) {
      whichPlan = oldPlan
    } else {
      throw new Error('idea updated')
    }
  } catch (e) {
    //
    console.log(e.message)

    const controller = new AbortController()
    const signal = controller.signal

    const openai = new OpenAI({
      baseURL: inbound.baseURL,
      apiKey: inbound.apiKey
    })

    const plan = await openai.chat.completions
      .create(
        {
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `
# My Knowledge of handlgin different thigns:

Handling for "nextjs":
- we use "nextjs" with "javascript esm modules and no eslint" for fullstack
- always enable cors support
- use this "tsconfig.json" config:
\`\`\`json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
\`\`\`

Handling for "cli-tool":
- if we need to build command line interface tool (cli-tool) we use "meow" package.

Handling for "browser":
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, {"waitUntil": "load"}, if we take screenshots we put it into "./nextjs/public/screenshots/[id].png", if we need to save text data we put it into json database

Handling for "LLM":
- if we need to connect to LLM: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default vision model is: "qwen/qwen3.5-9b", the default vision embedding model is: "qwen.qwen3-vl-embedding-2b"
- if we need to use LLM to stream text output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use LLM to generate json output: we use "openai" and "zod" npm package with lmstudio baseURL and apikey if needed

Handling for "generating embedding":
- if we need to use using LLM to make text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use using LLM to make image embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed

Handling for "database":
- if we need to use local json file based database, we use "db-local" npm package, aslo put json files into a "./nextjs/databases/[db].json" folder

Handling for "upload":
- if we need to handle upload files, we use "./nextjs/public/uploads" folder

# Instruction, write about diffrent kinds of system prompt:

Please write shared system prompt for both frotnend and backend:
  - app introduction
  - object keys naming convention
  - rest API Routes and Interface

Please write frontend system prompt:
    - Pages
    - Components
    ...

Please write backend system prompt:
    - Rest APIs
    - DB models
    ...

MUST HAVE GUIDELINE: 
You MUST NOT develop any code.

              `
            },
            {
              role: 'user',
              content: `
                ${inbound.appUserPrompt}
              `
            }
          ],

          stream: true,
          reasoning_effort: 'high',
          temperature: 0.5
          // response_format: {
          //   type: 'json_schema',
          //   json_schema: {
          //     name: 'output',
          //     schema: FinalOutput.toJSONSchema()
          //   }
          // }
        },
        { signal }
      )
      .then(async (response) => {
        let plan = ''
        for await (let event of response) {
          plan += event.choices[0].delta.content || ''

          onEvent({ type: 'stream', stream: removeThinkTags(plan) })
        }

        onEvent({ type: 'stream', stream: removeThinkTags(plan) })

        console.log(plan)

        return removeThinkTags(plan)

        //
        //
        // const content = response.choices[0].message.content || '{}'
        // const json = JSON.parse(content)
        // onEvent({ type: 'stream', stream: JSON.stringify(json) })
        // return JSON.stringify(json)
      })
      .catch((r) => {
        console.error(r)
        return null
      })

    onEvent({
      type: 'plan',
      plan: plan
    })

    whichPlan = plan

    let tt = setInterval(() => {
      if (checkAborted()) {
        clearInterval(tt)
        controller.abort()
        return
      }
    })

    if (signal.aborted) {
      throw new Error('')
    }
    if (checkAborted()) {
      throw new Error('')
    }

    try {
      await writeFile(
        join(workspace, 'ai-memory', 'app-idea.md'),
        inbound.appUserPrompt.trim(),
        'utf8'
      )
      await writeFile(join(workspace, 'ai-memory', 'system-plan.md'), whichPlan, 'utf8')
    } catch (e) {
      console.error('cannot write plan file')
    }
  }

  return whichPlan
}

//

function removeThinkTags(input) {
  // The 'g' flag is for global, the 's' flag is for dotAll (allows '.' to match newlines)
  const regex = /<think>[\s\S]*?<\/think>/gs
  const result = input.replace(regex, '')
  return result
}
