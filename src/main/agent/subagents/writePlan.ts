import OpenAI from 'openai'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { makeDirectory } from 'make-dir'
import { arch, cpus, platform } from 'os'
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

  const tt = setInterval(() => {
    if (checkAborted()) {
      clearInterval(tt)
      controller.abort()
      return
    }
  })

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

    /*

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

    */

    const plan = await openai.chat.completions
      .create(
        {
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `
# Role:
You are a senior software engineer, you write a "System prompt" for other AI Coding Agent to write code to achieve the goal set by the user.
You write the plan high level enough so that you don't implement the code. 

# Execution Plan & Know How Document:
- Current OS: ${platform()}
- Current Arch: ${arch()}
- CPU Cores: ${cpus()
                .map((r) => r.model)
                .join(', ')}

- MUST NOT implement code
- tell ai agent coder to MUST use bun runtime for js
- tell ai agent coder to MUST use relative path where it's suitable
- tell ai agent coder to MUST use temp folder where it's testing code 
- tell ai agent coder to have logger logic 
- list out package dependencies (Recommend others to use existing library from "nodejs npm" or "homebrew" or "apt-get")
- stay organised for the downloaded content or derived content using folders
- define folder structure with all file names, overall summary / purpose of each file included. let other AI Agent know that they must follow this structure so that code files are not duplicated or misplaces.
- Plan each code file with a file path and a overall description of each export functuon or each export const values or etc, each code file Must only have one export
- MUST include Goal Verification check up list for the user goal
`
            },
            {
              role: 'user',
              content: `User Goal: 
${inbound.appUserPrompt}
              `
            }
          ],

          stream: true,
          reasoning_effort: 'medium',
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
  }

  clearInterval(tt)
  return { plan: whichPlan }
}

//

function removeThinkTags(input) {
  // The 'g' flag is for global, the 's' flag is for dotAll (allows '.' to match newlines)
  const regex = /<think>[\s\S]*?<\/think>/gs
  const result = input.replace(regex, '')
  return result
}
