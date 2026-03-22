import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { success, z } from 'zod'
import { scanFolder } from '../utils/getSummary'
import { writeFile } from 'fs/promises'
// import moment from 'moment'
// import { Stonebox } from '@plust/stonebox'
import { execCommand } from './execCommand'
import { dirname, join } from 'path'
import { makeDirectory } from 'make-dir'
import { BlockTag, parseBlockTags, StreamFilesFormat } from './StreamFiles'

export type CommandResult = {
  command: string
  successful: boolean
  result: string
  timestamp: string
}

export type OneStep = {
  nextSteps: BlockTag[]
  codes: BlockTag[]
  logs: BlockTag[]
  stop: BlockTag[]

  commands: BlockTag[]
  commandResults: CommandResult[]
}

export async function writeCode({
  memory = [],
  plan,
  step,
  workspace,
  inbound,
  checkAborted,
  onEvent
}) {
  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  let prepareMessages = async (step: OneStep) => {
    const messages: ChatCompletionMessageParam[] = []

    messages.push({
      role: 'user',
      content: `
${plan}

# GUIDELINES:

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of node modules
MUST NOT run "npm run dev"

YOU MUST WORK Within folder: "${workspace}/code"
`.trim()
    })

    let files = await (await scanFolder(`${workspace}/code`)).trim()

    if (files) {
      messages.push({
        role: 'user',
        content: `
${files}
    `.trim()
      })
    }

    {
      let text = ''

      for (let one of step.commandResults) {
        let item = `
Time: ${one.timestamp || ''}
Command: ${one.command || ''} 
Result: ${one.successful ? `Successful` : `Failed`}
${one.result || ''}
    `.trim()

        text += `${item}\n`
      }

      if (text.trim()) {
        messages.push({
          role: 'user',
          content: text
        })
      }
    }

    {
      let text = ''
      for (let one of step.nextSteps) {
        let item = `
What to do now: ${one.content || ''}
    `.trim()

        text += `${item}\n`
      }

      if (text.trim()) {
        messages.push({
          role: 'user',
          content: text
        })
      }
    }

    {
      let text = ''
      for (let one of memory) {
        let item = `
Timestamp: ${one.timestamp}
Action Log: ${one.content || ''}
    `.trim()

        text += `${item}\n`
      }

      if (text.trim()) {
        messages.push({
          role: 'user',
          content: text
        })
      }
    }

    messages.push({
      role: 'user',
      content: `continue work if needed. thank you for all your hard work! \n 
# Guidelines:

MUST avoid duplicated export of same code modules
MUST avoid duplicated import of node modules
MUST NOT run "npm run dev"

YOU MUST WORK Within folder: "${workspace}/code"


# Instructions:

1. write about 1-2 sentences about what to do next: (using "next-step" tag)
2. write 1 terminal command at a time: (using "terminal" tag)
3. write 1 short action log 1-2 short sentences for AI agent to follow up the progress of the current task:  (using "log" tag)
4. write 1 code file at a time: (using "code" tag)
5. if we completely finished the development process then write a marker. (using "stop-development" tag)


${StreamFilesFormat}

`
    })

    return messages
  }

  let messages = await prepareMessages(step)

  if (messages instanceof Array) {
    onEvent({
      type: 'messages',
      messages: messages
    })
  }

  const controller = new AbortController()
  const signal = controller.signal

  const intrv = setInterval(() => {
    if (!signal.aborted && checkAborted()) {
      clearInterval(intrv)
      controller.abort()
    }
  }, 1)

  const blocks: BlockTag[] = await openai.chat.completions
    .create(
      {
        model: inbound.model,
        messages: messages,
        // response_format: {
        //   type: 'json_schema',
        //   json_schema: {
        //     name: 'worktask',
        //     schema: WorkTask.toJSONSchema()
        //   }
        // },
        stream: true,
        stream_options: {
          include_usage: true
        },
        reasoning_effort: 'high',
        temperature: 0.2
      },
      { signal }
    )
    .then(async (resp) => {
      let longContent = ''
      let thinking = ''
      let blocks = []
      for await (let event of resp) {
        let firstChoice = event?.choices[0]
        let delta = firstChoice?.delta as any
        let reason = delta?.reasoning_content || ''
        let content = delta?.content || ''

        thinking += reason
        longContent += content

        onEvent({ type: 'thinking', thinking: `${thinking}` })
        onEvent({ type: 'stream', stream: `${longContent}` })
      }

      onEvent({ type: 'thinking', thinking: `${thinking}` })
      onEvent({ type: 'stream', stream: `${longContent}` })

      blocks = parseBlockTags(`${thinking}\n${longContent}`, { trimContent: true }) || []

      return blocks
    })
    .catch((r) => {
      console.error(r)
      return null
    })

  onEvent({
    type: 'nProgressStart',
    nProgressStart: ``
  })
  clearInterval(intrv)

  console.log('blocks', blocks)

  let nextSteps = blocks.filter((r) => r.type === 'next-step')
  let logs = blocks.filter((r) => r.type === 'log')

  let codes = blocks.filter((r) => r.type === 'code')
  let commands = blocks.filter((r) => r.type === 'terminal')
  let stop = blocks.filter((r) => r.type === 'stop-development')

  let output: OneStep = {
    nextSteps: nextSteps,
    codes: codes,
    commands: commands,
    stop: stop,
    logs: logs,
    commandResults: []
  }

  // console.log(JSON.stringify(output, null, '\t'))

  if (codes) {
    for await (let file of codes) {
      //
      let path = file.path
      let content = file.content

      if (!path.startsWith(`${workspace}/code`)) {
        path = join(`${workspace}`, 'code', path)
      }

      await makeDirectory(dirname(path))

      await writeFile(path, content, 'utf8').catch((er) => {
        console.error(er)
      })
    }
  }

  if (commands) {
    for (let each of commands) {
      onEvent({
        type: 'cmd_begin',
        cmd_begin: each.content
      })

      console.log('cmd_begin', each.content)
      let res: any = await new Promise(async (resolve) => {
        return exec(
          `${(each.content || '').trim()}`,
          {
            cwd: `${workspace}/code`
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
            resolve({ successful: true, result: `${stdout}` })
          }
        )
      })

      onEvent({
        type: 'cmd_end',
        cmd_end: each.content
      })

      let commandResult: CommandResult = {
        command: each.content,
        successful: res.successful,
        result: res.result.trim(),
        timestamp: new Date().toString()
      }

      output.commandResults.push(commandResult)
    }
  }

  memory.push({
    idx: memory.length,
    timestamp: new Date().toString(),
    content: output.logs.map((r) => r.content).join('\n')
  })

  onEvent({
    type: 'nProgressEnd',
    nProgressEnd: ``
  })

  return output
}

//
