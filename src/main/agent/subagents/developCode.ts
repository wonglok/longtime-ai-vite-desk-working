import { exec, spawn } from 'child_process'
import { z } from 'zod'
import { join } from 'path'

import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { makeDirectory } from 'make-dir'

export async function developCode({ plan, appFolder, inbound, checkAborted, onEvent }) {
  const controller = new AbortController()
  const signal = controller.signal

  const intrv = setInterval(() => {
    if (!signal.aborted && checkAborted()) {
      clearInterval(intrv)
      controller.abort()
    }
  }, 1)

  const progressUpdateToolGen = async ({ agentName, allDoneMarker = { value: false } }) => {
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

        // if (
        //   todo.filter((r) => r.status === 'completed').length === todo.length &&
        //   todo.length > 0
        // ) {
        //   allDoneMarker.value = true
        // }

        return { success: true }
      }
    })
  }

  const terminalToolGen = async ({ subfolder = '' }) => {
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
        result: z.string()
        //
      }),
      async execute({ command }) {
        console.log('command', command)

        onEvent({
          type: 'cmd_begin',
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

    MUST HAVE GUIDELINES:

    current workspace path: "${appFolder}"
    current working directory (cwd): "${appFolder}"
    current frontend folder: "${appFolder}/frontend"
    current backend folder: "${appFolder}/backend"

    MUST Check the frontend and backend folder recursively to check status of development and update user about progress, before begin development work. (exclude "node_modules/**")

${plan}
    `

  const frontend = `
please tell user about progress updates while building the frontend of the app until it is fully completed.
    `
  const backend = `
please tell user about progress updates while building the backend of the app until it is fully completed.
    `

  let develop = async ({ actionPrompt, agentName, subfolder }) => {
    await makeDirectory(join(appFolder, 'ai-memory'))

    const memory = new Memory({
      storage: new LibSQLStore({
        id: `${agentName}`,
        url: `file:${join(appFolder, 'ai-memory', `${agentName}.db`)}`
      }),
      options: {
        lastMessages: 20,
        observationalMemory: {
          model: {
            url: inbound.baseURL,
            id: `lmstudio/${inbound.model}`,
            apiKey: inbound.apiKey
          },
          observation: {
            messageTokens: 10_000
          }
        }
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
      memory: memory,
      tools: {
        terminalTool: await terminalToolGen({ subfolder: subfolder }),
        progressUpdateTool: await progressUpdateToolGen({ agentName, allDoneMarker })
      },
      model: {
        url: inbound.baseURL,
        id: inbound.model,
        apiKey: inbound.apiKey
        // headers: {
        //   'X-Custom-Header': 'value'
        // }
      }
    })

    let runTurn = async () => {
      //

      const stream = await developerAgent.stream(
        [
          { role: 'user', content: actionPrompt }
          // { role: 'user', content: 'My day starts at 9am and finishes at 5.30pm' },
          // { role: 'user', content: 'I take lunch between 12:30 and 13:30' },
        ],
        {
          stopWhen: async () => {
            return allDoneMarker.value === true
          },
          maxSteps: 15,
          abortSignal: signal,
          memory: {
            thread: `${agentName}id`,
            resource: `${agentName}resource`
          },
          onFinish: () => {
            allDoneMarker.value === true
          },
          onIterationComplete: async () => {
            await memory.updateMessages({
              messages: await memory
                .listMessagesByResourceId({
                  resourceId: `${agentName}resource`
                })
                .then((r) => {
                  console.log(r.messages.map((r) => r.content))
                  return r.messages
                })
            })

            await memory.updateThread({
              id: `${agentName}id`,
              title: `${agentName}title`,
              metadata: {}
              // resourceId: `${agentName}resource`,
              // createdAt: new Date(),
              // updatedAt: new Date()
            })
          }
        }
      )

      let str = ''
      for await (const chunk of stream.textStream) {
        str += chunk
        onEvent({ type: 'stream', agentName: agentName, stream: str })
      }
      onEvent({ type: 'stream', agentName: agentName, stream: str })

      console.log(str)
      console.log('stream.finishReason', await stream.finishReason)

      if (!allDoneMarker.value) {
        await runTurn()
      }
    }

    await runTurn()
  }

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
}

//
