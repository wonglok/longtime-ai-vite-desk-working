import { exec, spawn } from 'child_process'
import OpenAI from 'openai'
import { z } from 'zod'
import { Agent, run, setDefaultOpenAIClient } from '@openai/agents'

import { tool } from '@openai/agents'

export async function getCodeDeveloped({ plan, appFolder, inbound, checkAborted, onEvent }) {
  const controller = new AbortController()
  const signal = controller.signal

  const intrv = setInterval(() => {
    if (!signal.aborted && checkAborted()) {
      clearInterval(intrv)
      controller.abort()
    }
  }, 1)

  const progressUpdateTool = tool({
    name: 'progressUpdateTool',
    description: 'send progress update to user',
    parameters: z.object({
      todo: z.array(
        z.object({
          task: z.string(),
          status: z.enum(['pending', 'active', 'completed'])
        })
      )
    }),
    async execute({ todo }) {
      //

      console.log('todo', todo)

      onEvent({
        type: 'todo',
        todo: todo
      })

      return ''
    }
  })

  const terminalTool = tool({
    name: 'terminalTool',
    description: 'run command in terminal',
    parameters: z.object({ command: z.string() }),
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
            cwd: `${appFolder}`
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

  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  setDefaultOpenAIClient(openai as any)

  const agent = new Agent({
    name: 'Assistant',
    model: inbound.model,
    instructions: `
    
    ${plan}
    
    MUST HAVE GUIDELINES:

    current workspace path: "${appFolder}"
    current current working directory (cwd): "${appFolder}"
    
    `,
    modelSettings: {
      temperature: 0,
      reasoning: {
        effort: 'high'
      }
    },
    tools: [
      //
      terminalTool,
      progressUpdateTool
    ]
  })

  const result = await run(
    agent,
    `
    please update ther user with progress while building the frontend and backend of the app until it is fully completed
    `,
    {
      stream: true,
      signal: signal
    }
  )

  let str = ''
  for await (const event of result) {
    // these are the raw events from the model
    if (event.type === 'raw_model_stream_event') {
      let fragment = (event as any).data?.event?.delta || ''
      str += fragment

      onEvent({ type: 'stream', stream: str })
    }
    // agent updated events
    if (event.type === 'agent_updated_stream_event') {
      console.log(`${event.type} %s`, event.agent.name)
    }
    // Agent SDK specific events
    if (event.type === 'run_item_stream_event') {
      str = ''
      console.log(`${event.type} %o`, event.item.toJSON())
    }
  }
}

//
