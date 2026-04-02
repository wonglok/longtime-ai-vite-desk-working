import { WorkSpacesPath } from '../server/workspace/constants'
// import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { join } from 'path'
// import { scanFolder } from './utils/getSummary'
import { listFiles } from './utils/listFiles'

export const readWorkspaceFiles = async ({
  mainWindow,
  event,
  inbound,
  randID,
  checkAborted,
  onEvent
}) => {
  //
  await makeDirectory(join(WorkSpacesPath, `${inbound.workspace}`, `ai-memory`))

  const files = await listFiles(join(WorkSpacesPath, `${inbound.workspace}`))

  //
  onEvent({ type: 'files', files: files })
  //
}
