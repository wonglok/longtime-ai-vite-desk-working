import { exec } from 'child_process'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
// import { success, z } from 'zod'
import { scanFolder } from '../utils/getSummary'
import { writeFile } from 'fs/promises'
// import moment from 'moment'
// import { Stonebox } from '@plust/stonebox'
// import { execCommand } from './execCommand'

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
  // nextContextPrompt: EachBlock[]
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
# System Prompt for the entire app:
${plan}

# Role Override:
You are a senior developer who writes code.

MUST work within "./app" workspace folder

You are a AI Coder Agent with a loop. you work on coding tasks by looking the info of step before and defining the future step. 

Assume the context window is limtied to ${10000} Tokens, try to reduce unecessary tokens like code comments.
`.trim()
    })

    // MUST WORK Within folder: "${workspace}/code"

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
        let note = ''
        if (one.result.length >= 1000) {
          note = '[only first 1000 characters are loaded in result]'
        }
        let item = `
Time: ${one.timestamp || ''}
Command: ${one.command || ''} 
Result: ${one.successful ? `Successful` : `Failed`} ${note}
${one.result.slice(0, 1000) || ''} 
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

      //
    }

    //     {
    //       let text = ''
    //       for (let one of step.nextContextPrompt) {
    //         let item = `
    // # Context Prompt for the current task:
    // ${one.content || ''}
    //     `.trim()

    //         text += `${item}\n`
    //       }

    //       if (text.trim()) {
    //         messages.push({
    //           role: 'user',
    //           content: text
    //         })
    //       }
    //     }

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
  - write 1 short action log for myself to read in the future:  (using <infoblock type="log">)
  - if needed, write 1 context prompt for myself to read in the next step: (using <infoblock type="next-context-prompt">) 
  - if needed, write 1 next step for myself to read in the future: (using <infoblock type="next-step">) 
  - if needed, write 1 checkup list to verifty the execution is aligned with the plan: (using  <infoblock type="next-checkup">) 
  - if needed, implement code MUST USE <infoblock type="code"> dont use terminal to write code
  - if needed, schedule 5 or LESS blocking terminal commands: (using  <infoblock type="terminal">) 
  - If needed, Verify the goal using "Goal Verification Checklist", if goal is achieved, write a marker to end the process: (using  <infoblock type="goal-achieved">) 
  
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

  // let nextContextPrompt = blocks.filter((r) => r.type === 'next-context-prompt')
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
    // nextContextPrompt: nextContextPrompt,
    commandResults: []
  }

  // console.log(JSON.stringify(output, null, '\t'))

  if (codes) {
    for await (let file of codes) {
      //
      let path = file.path
      let content = file.content

      if (path.includes('.lock')) {
        continue
      }

      await makeDirectory(dirname(join(`${workspace}`, 'code', path)))

      await writeFile(join(`${workspace}`, 'code', path), content, 'utf8').catch((er) => {
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
        return exec(
          `cd ${join(`${workspace}`, 'code')} && ${(each.content || '').trim()}`,
          {
            // cwd: `${workspace}/code`
          },
          (error, stdout, stderr) => {
            if (stderr) {
              console.error(`${stderr}`)
              return resolve({ successful: false, result: `${stderr}` })
            }
            if (error) {
              console.log(error)
              return resolve({ successful: false, result: `${error}` })
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
