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
  await makeDirectory(join(workspace, 'code'))

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
          max_completion_tokens: 4096,
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `
# Know how document: 

## if needed, guideline for "browser":
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, "page.goto(url, { waitUntil: 'load' });", if we take screenshots we put it into "./public/screenshots/[id].png", if we need to save text data we put it into "json database"
- always use {"fullPage": true} screenshot: await page.screenshot({ path: "./screenshot/[...].png", fullPage: true });

## if needed, guideline for "AI, LLM":
- if we need to connect to LLM: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default model is: "qwen/qwen3.5-4b", the default API KEY is "NULL"
- we use "openai" npm package with lmstudio 

## if needed, guideline for "generating text embedding":
- if we need to use using LLM to make text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- the default text embedding model is: "qwen.qwen3-vl-embedding-2b"

## if needed, guideline for "database":
- if we need to use local json file based database, put json files into a "./databases/[db].json" folder

## if needed, guideline for "upload":
- if we need to handle upload files, we use "./public/uploads" folder

## if needed, guideline for "dotenv"
- if we need to use dotenv , use this: "import { config } from 'dotenv';"

# Role:
You are a senior application planner, you write system prompt for other AI Agent to use.
You MUST NOT develop any code.

MUST use ESM JavaScript ".mjs" and never uses TypeScript
\`\`\`
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
          reasoning_effort: 'xhigh',
          temperature: 0.0
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
        let thinking = ''
        for await (let event of response) {
          // console.log(event.choices[0].delta)
          let delta = event.choices[0].delta as any
          thinking += delta.reasoning_content || ''
          plan += delta.content || ''

          onEvent({ type: 'thinking', thinking: `${thinking}` })
          onEvent({ type: 'stream', stream: `${plan}` })
        }

        onEvent({ type: 'thinking', thinking: plan })
        onEvent({ type: 'stream', stream: plan })

        console.log(plan)

        return plan
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
