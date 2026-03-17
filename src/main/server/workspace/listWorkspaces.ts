import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import promptTool from 'custom-electron-prompt'
import fs from 'fs'
import path from 'path'
import { getDirectoriesSync, WorkSpacesPath } from './constants'

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
