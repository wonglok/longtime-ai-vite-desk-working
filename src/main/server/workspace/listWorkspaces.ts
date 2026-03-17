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

export async function listWorkspaces({
  mainWindow,
  event,
  checkAborted,
  onEvent,
  inbound,
  randID
}) {
  let currentFolder = getDirectoriesSync(WorkSpacesPath)
  if (currentFolder.length === 0) {
    const defaltWorkspacePath = `${WorkSpacesPath}/DefaultWorkspace`
    await makeDirectory(defaltWorkspacePath)
  }

  let updateWorkspces = getDirectoriesSync(WorkSpacesPath).map((name) => {
    return {
      name: name,
      path: `${WorkSpacesPath}/${name}`
    }
  })

  event.reply(`${'askAI-reply'}${randID}`, { status: 'done', workspaces: updateWorkspces })
}
