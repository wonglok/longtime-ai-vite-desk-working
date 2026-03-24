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
import { EachBlock, InfoblockForamt, parseInfoblocks } from './InfoBlocks'

export type CommandResult = {
  command: string
  successful: boolean
  result: string
  timestamp: string
}

export type OneStep = {
  nextCheckup: EachBlock[]
  nextSteps: EachBlock[]
  codes: EachBlock[]
  logs: EachBlock[]
  stop: EachBlock[]

  commands: EachBlock[]
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
  //

  const openai = new OpenAI({
    baseURL: inbound.baseURL,
    apiKey: inbound.apiKey
  })

  const prepareMessages = async (step: OneStep) => {
    const messages: ChatCompletionMessageParam[] = []

    messages.push({
      role: 'user',
      content: `
# System Prompt Document:
${plan}

# Role Override:
You are a senior developer who writes code.

# GUIDELINES:
MUST WORK Within folder: "${workspace}/code"
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
      messages.push({
        role: 'user',
        content: `
# User original goal: (for reference, please refer to system prompt for execution plan)
${inbound.appUserPrompt}
        `
      })
    }

    {
      let text = ''

      for (let one of step.commandResults) {
        let item = `
Time: ${one.timestamp || ''}
Command: ${one.command || ''} 
Result: ${one.successful ? `Successful` : `Failed`} [only first 800 characters are loaded in result]
${one.result.slice(0, 800) || ''} 
------
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
# What to do now: 
${one.content || ''}
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
      for (let one of step.nextCheckup) {
        let item = `
# What to check up now: 
${one.content || ''}
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
------
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
      content: `
# Instructions:
    - understand what is going on by referencing to "What to do now" section, "action logs", "terminal results" and etc...
    - write 1 short action log with 2-3 sentences for myself to follow up the progress of the overall execution:  (using <infoblock type="log">)
    - write 1 short next step with 2-3 sentences for myself to read in the future: (using <infoblock type="next-step">) 
    - write what should we check in the next step with 2-3 sentences for myself to follow up the progress: (using  <infoblock type="next-checkup">) 
    - if needed, implement code: (using  <infoblock type="code">)
    - if needed, schedule 5 or LESS blocking terminal commands: (using  <infoblock type="terminal">) 
    - if needed, schedule 5 or LESS background terminal commands: (using "terminal" <infoblock extra="run-in-background">) 

    - Check User Goal Verification results in the action logs and terminal results
      - If goal is reached, Write a marker to end the process: (using  <infoblock type="goal-achieved">) 

${InfoblockForamt}
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

  const blocks: EachBlock[] = await openai.chat.completions
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
        reasoning_effort: 'medium',
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

      blocks = parseInfoblocks(`${longContent}`) || []

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

  // console.log('blocks', blocks)

  let nextSteps = blocks.filter((r) => r.type === 'next-step')
  let nextCheckup = blocks.filter((r) => r.type === 'next-checkup')
  let logs = blocks.filter((r) => r.type === 'log')

  let codes = blocks.filter((r) => r.type === 'code')
  let commands = blocks.filter((r) => r.type === 'terminal')
  let stop = blocks.filter((r) => r.type === 'goal-achieved')

  let output: OneStep = {
    nextCheckup: nextCheckup,
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

      console.log('each.extra', each.extra)
      console.log('cmd_begin', each.content)

      let res: any = await new Promise(async (resolve) => {
        //

        if (each?.extra === 'run-in-background') {
          let list = each.content.split(' ')
          let first = list[0]
          execCommand({
            spawnCmd: first,
            args: list.slice(1, list.length - 1),
            cwd: `${workspace}/code`,
            onEvent: onEvent
          })

          return resolve({ successful: true, result: `Running in background` })
        }

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

  if (output.logs.length > 0) {
    memory.push({
      idx: memory.length,
      timestamp: new Date().toString(),
      content: output.logs.map((r) => r.content).join('\n')
    })
  }

  onEvent({
    type: 'nProgressEnd',
    nProgressEnd: ``
  })

  return output
}

//
