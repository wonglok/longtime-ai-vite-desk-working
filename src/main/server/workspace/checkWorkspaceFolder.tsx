import { join } from 'path'
import { WorkSpacesPath } from './constants'
import { readFile } from 'fs/promises'

export async function checkWorkspaceFolder({
  mainWindow,
  event,
  checkAborted,
  onEvent,
  inbound,
  randID
}) {
  try {
    let workspaceFolder = await readFile(
      join(WorkSpacesPath, `${inbound.workspace}`, `workspace-path.txt`),
      {
        encoding: 'utf-8'
      }
    )
    onEvent({ type: 'folder', folder: workspaceFolder })
  } catch (e) {
    onEvent({ type: 'folder', folder: false })
    console.log(e)
  }
}
