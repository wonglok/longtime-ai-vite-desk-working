import { WorkSpacesPath } from '../server/workspace/constants'
// import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { join } from 'path'
// import { scanFolder } from './utils/getSummary'
import { listFiles } from './utils/listFiles'
import { readFile, writeFile } from 'fs/promises'
import { dialog } from 'electron'

export const readWorkspaceFiles = async ({
  mainWindow,
  event,
  inbound,
  randID,
  checkAborted,
  onEvent
}) => {
  //
  const aiIndex = join(WorkSpacesPath, `${inbound.workspace}`, `ai-index`)
  const aiMemory = join(WorkSpacesPath, `${inbound.workspace}`, `ai-memory`)
  const vectorDatabasePath = join(aiIndex, 'vector-database.json')
  let defaultData = { files: [] }

  let vectorDatabaseData = { ...defaultData }

  await makeDirectory(aiIndex)
  await makeDirectory(aiMemory)

  try {
    let str = await readFile(vectorDatabasePath, 'utf8')
    try {
      vectorDatabaseData = JSON.parse(str)
    } catch (e) {
      dialog.showErrorBox('Error', 'Cannot Parse AI Memory JSON')
    }
  } catch (e) {
    await writeFile(vectorDatabasePath, JSON.stringify(defaultData, null, '\t'), {
      encoding: 'utf8'
    })

    let str = await readFile(vectorDatabasePath, 'utf8')
    vectorDatabaseData = JSON.parse(str)
    console.log(e)
  }

  console.log(vectorDatabaseData)

  const files = await listFiles(join(WorkSpacesPath, `${inbound.workspace}`))
  onEvent({ type: 'files', files: files })

  //
}

//
