// import { MessageChannelMain, utilityProcess } from 'electron'
// import { generateJSON } from './tools/adapter'
// import { z } from 'zod'
// import { processPromptRequest } from './tools/processStack'
// import { prepToolListFiles } from './tools/fsTools'

import { runAgent } from './agent-pi/agent-sdk'

// import { utilityProcess, MessageChannelMain } from 'electron'
// import { runAgent } from './agent-pi/runAgent'
// function removeThinkTags(input) {
//   const regex = /<think>.*?<\/think>/gis
//   const result = input.replace(regex, '')
//   return result
// }

// console.log('plan', removeThinkTags(plan))

export const abortedFlags = {}
export const setupIPCMain = async ({ ipcMain, mainWindow }) => {
  //
  ipcMain.on('askAI-abort', async (event, inbound, randID) => {
    abortedFlags[randID] = abortedFlags[randID] || true
  })

  ipcMain.on('askAI-message', async (event, inbound, randID) => {
    try {
      if (inbound.action === 'message') {
        await runAgent({
          inbound,
          checkAborted: () => {
            return abortedFlags[randID] === true
          },
          onEvent: ({ type, text }) => {
            mainWindow.webContents.send(
              `askAI-stream${randID}`,
              JSON.stringify({
                type: type,
                text: text
              })
            )
          }
        })
      }

      event.reply(`${'askAI-reply'}${randID}`, { status: 'done' })
    } catch (e) {
      console.error(e)
      event.reply(`${'askAI-reply'}${randID}`, { status: 'failed' })
    } finally {
    }
  })
}
