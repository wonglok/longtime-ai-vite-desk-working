import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import promptTool from 'custom-electron-prompt'
import fs from 'fs'
import path from 'path'
import { getDirectoriesSync, WorkSpacesPath } from './constants'

export async function checkWorkspace({
  mainWindow,
  event,
  checkAborted,
  onEvent,
  inbound,
  randID
}) {
  let currentFolder = fs.statSync(`${WorkSpacesPath}/${inbound.folderName}`).isDirectory()

  event.reply(`${'askAI-reply'}${randID}`, { exist: currentFolder })
}
