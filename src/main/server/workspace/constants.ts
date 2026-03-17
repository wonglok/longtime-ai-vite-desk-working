import { app } from 'electron'
import fs from 'fs'
import path from 'path'
export const DocPath = app.getPath('documents')
export const WorkSpacesPath = `${DocPath}/ai-home/workspaces/`

export function getDirectoriesSync(dirPath) {
  return fs.readdirSync(dirPath).filter(function (file) {
    // Check if the item is a directory
    return fs.statSync(path.join(dirPath, file)).isDirectory()
  })
}
