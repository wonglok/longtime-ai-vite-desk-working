// import { MessageChannelMain, utilityProcess } from 'electron'
// import { generateJSON } from './tools/adapter'
// import { z } from 'zod'
// import { processPromptRequest } from './tools/processStack'
// import { prepToolListFiles } from './tools/fsTools'

import { runAppPlanner } from './agent/runAppPlanner'
import { checkWorkspace } from './server/workspace/checkWorkspace'
import { createWorkspace } from './server/workspace/createWorkspace'
import { listWorkspaces } from './server/workspace/listWorkspaces'

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
    console.log('abortedFlags[randID]', abortedFlags[randID])
  })

  ipcMain.on('askAI-message', async (event, inbound, randID) => {
    try {
      // if (inbound.route === 'runAgent') {
      //   await runAgent({
      //     inbound,
      //     randID,
      //     checkAborted: () => {
      //       return abortedFlags[randID]
      //     },
      //     onEvent: (ev) => {
      //       mainWindow.webContents.send(`askAI-stream${randID}`, JSON.stringify(ev))
      //     }
      //   })
      // }

      // if (inbound.route === 'runSkill') {
      //   await runSkill({
      //     inbound,
      //     randID,
      //     checkAborted: () => {
      //       return abortedFlags[randID]
      //     },
      //     onEvent: (ev) => {
      //       mainWindow.webContents.send(`askAI-stream${randID}`, JSON.stringify(ev))
      //     }
      //   })
      // }

      if (inbound.route === 'runAppPlanner') {
        await runAppPlanner({
          inbound,
          randID,
          done: () => {
            abortedFlags[randID] = true
            event.reply(`${'askAI-reply'}${randID}`, { status: 'done' })
          },
          checkAborted: () => {
            return abortedFlags[randID]
          },
          onEvent: (ev) => {
            mainWindow.webContents.send(`askAI-stream${randID}`, JSON.stringify(ev))
          }
        })
      }

      ///
      ///
      ///
      ///
      ///

      if (inbound.route === 'listWorkspaces') {
        return await listWorkspaces({
          mainWindow,
          event,
          inbound,
          randID,
          checkAborted: () => {
            return abortedFlags[randID]
          },
          onEvent: (ev) => {
            mainWindow.webContents.send(`askAI-stream${randID}`, JSON.stringify(ev))
          }
        })
      }

      if (inbound.route === 'createWorkspace') {
        return await createWorkspace({
          mainWindow,
          event,
          inbound,
          randID,
          checkAborted: () => {
            return abortedFlags[randID]
          },
          onEvent: (ev) => {
            mainWindow.webContents.send(`askAI-stream${randID}`, JSON.stringify(ev))
          }
        })
      }

      if (inbound.route === 'checkWorkspace') {
        return await checkWorkspace({
          mainWindow,
          event,
          inbound,
          randID,
          checkAborted: () => {
            return abortedFlags[randID]
          },
          onEvent: (ev) => {
            mainWindow.webContents.send(`askAI-stream${randID}`, JSON.stringify(ev))
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
