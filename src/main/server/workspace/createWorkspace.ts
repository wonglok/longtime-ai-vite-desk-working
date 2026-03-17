import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import promptTool from 'custom-electron-prompt'
import fs from 'fs'
import path from 'path'

const DocPath = app.getPath('documents')
const WorkSpacesPath = `${DocPath}/ai-home/workspaces/`

function getDirectoriesSync(dirPath) {
  return fs.readdirSync(dirPath).filter(function (file) {
    // Check if the item is a directory
    return fs.statSync(path.join(dirPath, file)).isDirectory()
  })
}

export async function createWorkspace({
  mainWindow,
  event,
  checkAborted,
  onEvent,
  inbound,
  randID
}) {
  promptTool({
    title: 'Enter Value',
    label: 'Please input your text:',
    value: 'default value', // Optional default value
    type: 'input',
    parentBrowserWindow: mainWindow as any // Make the prompt modal to the main window
  } as any)
    .then((r) => {
      if (r === null) {
        console.log('Dialog cancelled')
      } else {
        console.log('User entered:', r)
      }
    })
    .catch(console.error)
}
