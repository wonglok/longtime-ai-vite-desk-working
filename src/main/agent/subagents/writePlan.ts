import OpenAI from 'openai'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { makeDirectory } from 'make-dir'
// import z from 'zod'

// const TodoList = z.array(
//   z.discriminatedUnion('status', [
//     z
//       //
//       .object({
//         status: z.literal('pending'),
//         task: z.string().describe('task description')
//       })
//       .describe('pending task'),
//     z
//       //
//       .object({
//         status: z.literal('completed'),
//         task: z.string().describe('task description')
//       })
//       .describe('completed task'),
//     z
//       //
//       .object({
//         status: z.literal('in-progress'),
//         task: z.string().describe('task description')
//       })
//       .describe('in-progress task')
//   ])
// )

export async function writePlan({ workspace, inbound, checkAborted, onEvent }) {
  const controller = new AbortController()
  const signal = controller.signal

  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

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

    const plan = await openai.chat.completions
      .create(
        {
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `

# Instruction:

Please write shared system prompt for both frotnend and backend:
  - app introduction
  - object keys naming convention
  - rest API Routes and Interface

Please write frontend prompt:
    - Pages
    - Components
    - Data flow

Please write backend prompt:
    - Rest APIs
    - DB models
    - AI Integration 
    - Security and Configuration

Please write a todo list:

...

# MUST HAVE GUIDELINE: 

You MUST NOT develop any code.

Handling for "nextjs":
- we use "nextjs" for fullstack app
- always enable cors support

- we use "App Router" of the "nextjs" 
- home page file is at: "./src/app/page.tsx"
- layout file is at: "./src/app/layout.tsx"

Handling for "cli-tool":
- if we need to build command line interface tool (cli-tool) we use "meow" package.

Handling for "browser":
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, {"waitUntil": "load"}, if we take screenshots we put it into "./public/screenshots/[id].png", if we need to save text data we put it into "json database"

Handling for "AI, LLM":
- if we need to connect to LLM: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default model is: "qwen/qwen3.5-4b", 
- we use "openai" npm package with lmstudio 

Handling for "generating text embedding":
- if we need to use using LLM to make text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- the default text embedding model is: "qwen.qwen3-vl-embedding-2b"

Handling for "database":
- if we need to use local json file based database, we use "db-local" npm package, aslo put json files into a "./databases/[db].json" folder

Handling for "upload":
- if we need to handle upload files, we use "./public/uploads" folder

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
          reasoning_effort: 'medium',
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

    if (signal.aborted) {
      throw new Error('request is aborted')
    }
    if (checkAborted()) {
      throw new Error('request is aborted')
    }

    clearInterval(tt)
  }

  return { plan: whichPlan }
}

//

function removeThinkTags(input) {
  // The 'g' flag is for global, the 's' flag is for dotAll (allows '.' to match newlines)
  const regex = /<think>[\s\S]*?<\/think>/gs
  const result = input.replace(regex, '')
  return result
}
