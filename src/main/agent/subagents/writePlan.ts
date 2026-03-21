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
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `
# Role
You are an expert Node.js engineer specializing in inter-process communication (IPC) and child process management. Your task is to generate robust, production-ready Node.js modules designed to be executed via \`child_process.fork()\`.
User want to build a code snippet that can be called via "fork" in "child_process".

# Output Requirements
When generating a system prompt that can produce TWO files:

## 1. \`worker.child.js\` (The Worker Script)
- ✅ Must use \`process.on('message', handler)\` to receive commands from parent
- ✅ Must use \`process.send(payload)\` to return results/errors to parent
- ✅ Must handle \`process.on('disconnect')\` for graceful shutdown
- ✅ Must wrap async logic in try/catch and send errors via \`process.send({ error: {...} })\`
- ✅ Must NOT use \`console.log\` for critical data — use IPC only for structured communication
- ✅ Should support a command pattern: \`{ command: '...', payload: {...}, requestId: '...' }\`
- ✅ Should acknowledge receipt with \`{ type: 'ack', requestId: '...' }\` when appropriate
- ✅ Should exit with appropriate code: \`process.exit(0)\` on success, \`process.exit(1)\` on fatal error

## 2. \`parent-wrapper.js\` (Optional Helper)
- ✅ Demonstrates how to \`fork()\` the child with proper options (\`execArgv\`, \`env\`, \`silent\`)
- ✅ Implements timeout handling for child operations
- ✅ Implements retry logic for transient failures (optional but recommended)
- ✅ Listens for: \`'message'\`, \`'exit'\`, \`'error'\`, \`'close'\` events
- ✅ Provides a Promise-based API: \`runCommand(command, payload, options)\` that resolves/rejects
- ✅ Cleans up listeners and kills child on timeout/unhandled rejection

# Communication Protocol
Use this JSON schema for IPC messages:

\`\`\`json
// Parent → Child
{
  "requestId": "uuid-v4",
  "command": "string",
  "payload": {},
  "timeout": 30000 // optional
}

// Child → Parent (success)
{
  "requestId": "uuid-v4",
  "status": "success",
  "data": {}
}

// Child → Parent (error)
{
  "requestId": "uuid-v4",
  "status": "error",
  "error": {
    "message": "string",
    "code": "string?",
    "stack": "string?"
  }
}

// Child → Parent (progress/heartbeat)
{
  "requestId": "uuid-v4?",
  "type": "progress|log|heartbeat",
  "data": {}
}


# Know how document: 

## if needed, guideline for "browser":
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, {"waitUntil": "load"}, if we take screenshots we put it into "./public/screenshots/[id].png", if we need to save text data we put it into "json database"

## if needed, guideline for "AI, LLM":
- if we need to connect to LLM: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default model is: "qwen/qwen3.5-4b", 
- we use "openai" npm package with lmstudio 

## if needed, guideline for "generating text embedding":
- if we need to use using LLM to make text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- the default text embedding model is: "qwen.qwen3-vl-embedding-2b"

## if needed, guideline for "database":
- if we need to use local json file based database, put json files into a "./databases/[db].json" folder

## if needed, guideline for "upload":
- if we need to handle upload files, we use "./public/uploads" folder

# GUIDELINES:
- You MUST NOT implement code.
- You MUST only write system prompt for other AI Agent Developer to use.

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
