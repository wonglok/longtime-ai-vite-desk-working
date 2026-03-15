import { exec, spawn } from 'child_process'
import { z } from 'zod'
import { join } from 'path'

import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { makeDirectory } from 'make-dir'

const failCounter = {}
export async function developCode({ randID, plan, appFolder, inbound, checkAborted, onEvent }) {
  failCounter[randID] = failCounter[randID] || 0

  const controller = new AbortController()
  const signal = controller.signal

  const intrv = setInterval(() => {
    if (!signal.aborted && checkAborted()) {
      clearInterval(intrv)
      controller.abort()
    }
  }, 1)

  const progressUpdateToolGen = async ({
    agentName,
    subfolder,
    allDoneMarker = { value: false }
  }) => {
    //
    return createTool({
      id: 'progressUpdateTool',
      description: 'send progress update to user',
      inputSchema: z.object({
        todo: z.array(
          z.object({
            task: z.string(),
            status: z.enum(['pending', 'in-progress', 'completed'])
          })
        )
      }),
      outputSchema: z.object({
        success: z.boolean()
      }),
      async execute({ todo }) {
        console.log('todo', todo)

        onEvent({
          type: 'todo',
          agentName: agentName,
          todo: todo
        })
        if (
          todo.filter((r) => r.status === 'completed').length === todo.length &&
          todo.length > 5
        ) {
          allDoneMarker.value = true
        }
        return { success: true }
      }
    })
  }

  //

  const terminalToolGen = async ({ agentName, subfolder = '' }) => {
    return createTool({
      id: 'terminalTool',
      description: 'run command in terminal',
      inputSchema: z.object({
        //
        command: z.string()
      }),
      outputSchema: z.object({
        //
        successful: z.boolean(),
        //
        result: z.string()
        //
      }),
      async execute({ command }) {
        console.log('command', command)

        onEvent({
          type: 'cmd_begin',
          agentName: agentName,
          cmd_begin: command
        })

        let res: any = await new Promise((resolve) => {
          exec(
            `${command}`,
            {
              cwd: `${join(appFolder, subfolder)}`
            },
            (error, stdout, stderr) => {
              if (error) {
                console.log('error', error)
                return resolve({ successful: false, result: `${stderr}` })
              }
              if (stderr) {
                console.error(`error: ${stderr}`)

                return resolve({ successful: false, result: `${stderr}` })
              }
              return resolve({ successful: true, result: `${stdout}` })
            }
          )
        })

        onEvent({
          type: 'cmd_end',
          cmd_end: command
        })

        return res
      }
    })
  }

  const systemPrompt = `
# IDENTITY and SOUL:
You love others first, others love you too and you love back of course. You love emoji.

# MUST HAVE GUIDELINES:

current workspace path: "${appFolder}"
current working directory (cwd): "${appFolder}"
current frontend folder: "${appFolder}/frontend"
current backend folder: "${appFolder}/backend"

MUST check the latest files in the workspace before development work.
${plan}
`

  const frontend = `
please continue or begin building the frontend code. thank you!
  `
  const backend = `
please continue or begin building the backend code. thank you!
  `

  let develop = async ({ actionPrompt, agentName, subfolder }) => {
    await makeDirectory(join(appFolder, 'ai-memory'))

    const memory = new Memory({
      storage: new LibSQLStore({
        id: `${agentName}`,
        url: `file:${join(appFolder, 'ai-memory', `${agentName}.db`)}`
      }),
      options: {
        lastMessages: 10

        // observationalMemory: {
        //   model: {
        //     url: inbound.baseURL,
        //     id: `lmstudio/${inbound.model}`,
        //     apiKey: inbound.apiKey
        //   },
        //   observation: {
        //     messageTokens: 30_000
        //   }
        // }
      }
    })

    const allDoneMarker = { value: false }
    const developerAgent = new Agent({
      id: 'Senior Fullstack Developer',
      name: 'Senior Fullstack Developer',

      instructions: [
        {
          role: 'system',
          content: systemPrompt,
          providerOptions: {
            openai: { reasoningEffort: 'high' } // OpenAI's reasoning models
          }
        }
      ],
      model: {
        provider: 'OPENAI',
        url: inbound.baseURL,
        id: `lmstudio/${inbound.model}`,
        apiKey: inbound.apiKey
      },
      memory: memory,
      tools: {
        terminalTool: await terminalToolGen({
          //
          agentName: agentName,
          subfolder: subfolder
        }),
        progressUpdateTool: await progressUpdateToolGen({
          agentName: agentName,
          subfolder: subfolder,
          allDoneMarker
        })
      }
    })

    const runTurn = async () => {
      const stream = await developerAgent.stream([{ role: 'user', content: actionPrompt }], {
        stopWhen: async () => {
          return allDoneMarker.value === true
        },
        maxSteps: 10,
        providerOptions: {
          openai: { reasoningEffort: 'high' } // OpenAI's reasoning models
        },
        abortSignal: signal,
        memory: {
          thread: `${agentName}`,
          resource: `${agentName}`
        },
        onStepFinish: async () => {
          await memory.updateMessages({
            messages: await memory
              .listMessagesByResourceId({
                resourceId: `${agentName}`
              })
              .then((r) => {
                return r.messages
              })
          })

          await memory.updateThread({
            id: `${agentName}`,
            title: `${agentName}`,
            metadata: {}
          })
        }
      })

      let str = ''
      for await (const chunk of await stream.textStream) {
        str += chunk

        onEvent({ type: 'stream', agentName: agentName, stream: str })
      }
      onEvent({ type: 'stream', agentName: agentName, stream: str })

      // can run
      if ((await stream.finishReason) === 'length') {
        return await runTurn().catch(() => {
          failCounter[randID] += 1
        })
      }

      // can run
      if ((await stream.finishReason) === 'tool-calls') {
        return await runTurn().catch(() => {
          failCounter[randID] += 1
        })
      }

      if ((await stream.finishReason) === 'stop') {
        failCounter[randID] += 1
        return
      }

      if ((await stream.finishReason) === 'tripwire') {
        failCounter[randID] += 1
        return
      }

      if (failCounter[randID] >= 50) {
        return
      }

      // if (allDoneMarker.value) {
      //   return
      // }

      // can run
      return await runTurn().catch(() => {
        failCounter[randID] += 1
      })
    }

    await runTurn().catch(() => {
      failCounter[randID] += 1
    })
  }

  onEvent({ type: 'stream', stream: '' })

  await Promise.all([
    //
    develop({
      //
      agentName: 'frontend',
      subfolder: 'frontend',
      actionPrompt: frontend
    }),
    develop({
      //
      agentName: 'backend',
      subfolder: 'backend',
      actionPrompt: backend
    })
  ])

  clearInterval(intrv)
}

//
