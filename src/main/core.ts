// import { MessageChannelMain, utilityProcess } from 'electron'
// import { generateJSON } from './tools/adapter'
// import { z } from 'zod'
// import { processPromptRequest } from './tools/processStack'
// import { prepToolListFiles } from './tools/fsTools'

import { enhancedAgent } from './agent/example'

// function removeThinkTags(input) {
//   const regex = /<think>.*?<\/think>/gis
//   const result = input.replace(regex, '')
//   return result
// }

// console.log('plan', removeThinkTags(plan))

export const setupIPCMain = async ({ ipcMain, mainWindow }) => {
  //
  ipcMain.on('askAI-message', async (event, inbound, randID) => {
    //

    try {
      mainWindow.webContents.send(`askAI-stream${randID}`, `Begin Processing Todo list...`)

      if (inbound.action === 'message') {
        await enhancedAgent({
          mainWindow,
          event,
          inbound,
          randID
        })
      }

      event.reply(`${'askAI-reply'}${randID}`, { status: 'done' })
    } catch (e) {
      event.reply(`${'askAI-reply'}${randID}`, { status: 'failed' })
    } finally {
    }
  })
}
