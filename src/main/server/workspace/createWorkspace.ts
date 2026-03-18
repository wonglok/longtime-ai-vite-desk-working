import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import promptTool from 'custom-electron-prompt'
import fs from 'fs'
import path, { join } from 'path'
import { getDirectoriesSync, WorkSpacesPath } from './constants'

export async function createWorkspace({
  mainWindow,
  event,
  checkAborted,
  onEvent,
  inbound,
  randID
}) {
  //

  //
  await promptTool({
    title: 'Name your new workspace',
    label: 'Think of a name for your workspace:',
    value: 'Work', // Optional default value
    type: 'input',
    parentBrowserWindow: mainWindow as any // Make the prompt modal to the main window
  } as any)
    .then(async (r) => {
      if (r === null) {
        console.log('Dialog cancelled')
      } else {
        console.log('User entered:', r)

        //
        await makeDirectory(join(WorkSpacesPath, `${r}`))

        const updatedWorkspaces = getDirectoriesSync(WorkSpacesPath).map((name) => {
          return {
            name: name,
            path: `${WorkSpacesPath}/${name}`
          }
        })

        event.reply(`${'askAI-reply'}${randID}`, { workspaces: updatedWorkspaces })
      }
    })
    .catch(console.error)
}
