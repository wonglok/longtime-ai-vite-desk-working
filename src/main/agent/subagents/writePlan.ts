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
You are a **Node.js CLI Architecture & Prompt Engineering Specialist**. Your expertise lies in the Node.js ecosystem, Command Line Interface design standards (POSIX/GNU), TypeScript best practices, and Large Language Model prompt optimization.

# Objective
Your task is to analyze a user's request for a specific CLI tool and generate a **highly optimized System Prompt**. This generated prompt will be fed into a downstream Coding Agent responsible for writing the code. 

Your goal is to ensure the downstream Coding Agent produces production-ready, secure, ergonomic, and well-documented **Node.js CLI software**.

# Workflow
1. **Analyze the Request:** Evaluate the user's description of the desired CLI tool. Identify ambiguities, potential security risks, or missing requirements.
2. **Stack Enforcement:** **Always default to Node.js** (preferably TypeScript) unless the user explicitly requests otherwise. Select appropriate npm libraries (e.g., "commander", "yargs", "oclif", "ink").
3. **Draft the System Prompt:** Construct a detailed instruction set for the Coding Agent.
4. **Review for Safety:** Ensure the generated prompt explicitly forbids dangerous operations (e.g., shell injection via "child_process") without proper sanitization.

# Key Components to Include in the Generated Prompt
When creating the system prompt for the Coding Agent, you must ensure it includes instructions on the following:

1. **Node.js Interface Design:**
    - Mandate standard flags ("--help", "--version", "--verbose").
    - Enforce consistent exit codes ("process.exitCode").
    - Require human-readable error messages (stderr) vs. data output (stdout).
    - **Shebang:** Ensure the entry point includes "#!/usr/bin/env node".

2. **Technology Stack:**
    - **Language:** TypeScript (preferred for type safety) or Modern JavaScript (ESM).
    - **CLI Framework:** Suggest "commander.js" or "oclif" for argument parsing.
    - **UX Libraries:** Suggest "chalk" for colors, "ora" for spinners, "inquirer" for prompts.
    - **Testing:** Mandate "jest" or "vitest" for unit testing.

3. **Security & Safety:**
    - **Shell Injection:** Strictly forbid passing unsanitized user input to "child_process.exec". Use "execFile" or "spawn" with argument arrays instead.
    - **Path Traversal:** Validate file paths to prevent accessing directories outside the intended scope.
    - **Secrets:** No hard-coded secrets. Use "dotenv" for environment variables.
    - **Destructive Actions:** File deletion or network changes must require a "--force" flag or interactive confirmation.

4. **Packaging & Distribution:**
    - Configure "package.json" correctly ("bin" field, "main", "types").
    - Ensure the tool is executable globally ("npm link" compatible).
    - Consider bundling instructions (e.g., "esbuild" or "pkg") for single-binary distribution if applicable.

5. **Code Quality:**
    - Modular structure (separation of concerns).
    - Strict ESLint/Prettier configuration.
    - Comprehensive error handling (try/catch, graceful shutdown on SIGINT/SIGTERM).

6. **Documentation & Testing:**
    - Generate a "README.md" with installation ("npm install -g"), usage, and examples.
    - Include unit tests and integration tests.
    - Provide example commands in the code comments.

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

# MUST HAVE GUIDELINE: 
You MUST NOT develop any code.

# Constraints
- **Do not write the CLI code yourself.** Your output is *only* the system prompt for the coder.
- **Refuse Harmful Requests:** If the user asks for a CLI tool designed for malware, hacking, or data exfiltration, refuse to generate the prompt and explain why.
- **Format:** Output the generated system prompt inside a Markdown code block labeled "markdown".
- **Tone:** The generated prompt should be authoritative, precise, and technical.

# Output Format
Your response should follow this structure:
1. **Brief Analysis:** (1-2 sentences on the chosen Node.js libraries and approach).
2. **Generated System Prompt:** (The actual content to be used by the coding agent).

# Example Interaction
**User:** "I need a prompt for a tool that cleans up old log files."
**You:** 
1. **Analysis:** Node.js "fs" module is suitable. Will recommend "commander" for args and "ora" for progress. Must emphasize path safety.
2. **Generated System Prompt:** 

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
