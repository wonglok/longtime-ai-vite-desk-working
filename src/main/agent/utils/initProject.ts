import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'

async function checkFolderExists(folderPath) {
  try {
    await access(folderPath)
    console.log(`Folder "${folderPath}" exists.`)
    return true
  } catch (error) {
    console.error(`Folder "${folderPath}" does not exist or is inaccessible.`)
    return false
  }
}

export const initProject = async ({ workspace, onEvent }) => {
  if (await checkFolderExists(`${workspace}/nextjs/src`)) {
    console.log('project is here')
    onEvent({ type: 'init', init: `Nextjs Project Folder is here.` })
    return 'ok'
  }

  await new Promise(async (resolve) => {
    onEvent({ type: 'init', init: `Creating Nextjs Project Folder.` })

    let proc = await spawn(
      `npx`,
      `create-next-app@latest nextjs --tailwind --no-linter --src-dir --webpack  --ts --yes --use-yarn`
        //
        .split(' '),
      {
        cwd: `${workspace}`
      }
    )

    proc.on('message', (ev) => {
      console.log(ev)
    })

    proc.stdout.on('data', (ev) => {
      console.log(`${ev}`)
      onEvent({ type: 'init', init: `${ev}` })
    })

    proc.on('exit', (ev) => {
      console.log('exit', ev)
      resolve(null)
    })

    proc.on('close', () => {
      resolve(null)
    })

    return
  })

  return 'ok'
}
