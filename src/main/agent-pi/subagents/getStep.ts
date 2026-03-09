import { exec } from 'child_process'
import OpenAI from 'openai'
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam
} from 'openai/resources/index.mjs'
import { z } from 'zod'

const WorkTask = z.object({
  // memory: z
  //   .string()
  //   .describe('write a memory for myself to read again, i output memory so that i dont forget.'),

  // currentThoughts: z
  //   .string()
  //   .describe(`Short term memory about the task that i'm currently working on.`),

  todo: z
    .array(
      z.object({
        done: z.boolean(),
        task: z.string()
      })
    )
    .describe('a todo items, mark todo items'),

  terminalCMD: z.string().describe('terminal command').optional()
})

export type WorkStep = z.infer<typeof WorkTask> & {
  lastCommandResult?: string
  lastCommandCall?: string
}

export async function getStep({ step, workspace, inbound, checkAborted, onEvent }) {
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let insertLastStep = (step: WorkStep) => {
    let array: ChatCompletionMessageParam[] = []

    // if (step.memory) {
    //   array.push({
    //     role: 'user',
    //     content: `
    // Here's the memory i wrote for myself to read, which summarise all the memories in my mind so that i dont forget:
    // ${step.memory}`
    //   })
    // }

    if (step.todo) {
      array.push({
        role: 'user',
        content: `
Here's the todo that i wrote for me before like a todo list:

${step.todo
  .map((r) => {
    return `${r.done ? `[x]` : `[]`} ${r.task}`
  })
  .join('\n')}
          `
      })
    }

    if (step?.lastCommandCall) {
      array.push({
        role: 'user',
        content: `
Here's the last terminal command i wrote:
${step?.lastCommandCall}`
      })
    }

    if (step?.lastCommandResult) {
      array.push({
        role: 'user',
        content: `
Here's the result of the terminal command i wrote before:
${step.lastCommandResult}`
      })
    }

    return array
  }

  const msg: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `
You are an AI senior developer.

The current workspace is: ${workspace}

You do things step by step.
          `.trim()
    },

    {
      role: 'user',
      content: `

Instruction:
You only work at the workspace:  ${workspace}
You help build the user idea.

Here's the user app idea:
${inbound.appSpec}
          `
    },

    ...insertLastStep(step)
  ]

  onEvent({
    type: 'messages',
    text: JSON.stringify(msg)
  })

  const workstep = await openai.chat.completions
    .create({
      model: inbound.model,
      messages: msg,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'worktask',
          schema: WorkTask.toJSONSchema()
        }
      }
    })
    .then((response) => {
      //
      // console.log(response.choices[0].message)
      //
      return JSON.parse(response.choices[0].message.content!) as WorkStep
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  if (workstep) {
    if (workstep?.terminalCMD) {
      const terminalCmd = workstep.terminalCMD

      const termianlResult = await new Promise((resolve) => {
        return exec(
          `${terminalCmd}`,
          {
            cwd: `${workspace}`
          },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return resolve(null)
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`)
              return resolve(null)
            }
            // console.log(`stdout: ${stdout}`)

            resolve(stdout)
          }
        )
      })

      workstep.lastCommandCall = terminalCmd as string
      workstep.lastCommandResult = termianlResult as string
    } else {
      workstep.lastCommandCall = ''
      workstep.lastCommandResult = ''
    }
  }

  console.log(workstep)

  // onEvent({
  //   type: 'workstep',
  //   text: JSON.stringify(workstep, null, '\t')
  // })

  return workstep
}

//
