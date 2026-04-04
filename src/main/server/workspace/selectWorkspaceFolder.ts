// import { app } from 'electron'
// import { makeDirectory } from 'make-dir'
// import { join } from 'path'
// import { scanFolder } from './utils/getSummary'
// import { readFile, writeFile } from 'fs/promises'
import { app, dialog } from 'electron'
import { WorkSpacesPath } from './constants'
import { join } from 'path'
import { writeFile } from 'fs/promises'

export const selectWorkspaceFolder = async ({
  mainWindow,
  event,
  inbound,
  randID,
  checkAborted,
  onEvent
}) => {
  //

  let dir = await dialog
    .showOpenDialog(mainWindow, {
      defaultPath: app.getPath('documents'),
      title: 'Select a Folder for AI to use',
      properties: ['openDirectory', 'createDirectory', 'dontAddToRecent']
    })
    .then((data) => {
      //
      console.log(data)

      return data
    })

  if (!dir.canceled && dir.filePaths[0]) {
    //
    let firstFolder = dir.filePaths[0]

    await writeFile(
      join(WorkSpacesPath, `${inbound.workspace}`, `workspace-path.txt`),
      firstFolder,
      {
        encoding: 'utf-8'
      }
    )

    console.log('selectWorkspaceFolder', firstFolder)
    onEvent({ type: 'folder', folder: firstFolder })

    return firstFolder
    //
  }

  return false
  //
}
