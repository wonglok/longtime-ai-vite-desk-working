import { spawn } from 'node:child_process'

export const execCommand = async ({ spawnCmd, args, cwd, onEvent }) => {
  let str = ''
  let successful = true
  await new Promise(async (resolve, reject) => {
    onEvent({ type: 'init', init: `Running ${spawnCmd} ${args.join(' ')}` })

    let proc = await spawn(`${spawnCmd}`, args, {
      cwd: `${cwd}`
    })

    proc.on('error', (err) => {
      console.error(err)
      str = `${err.message}`
      successful = false
    })

    proc.on('message', (ev) => {
      console.log(ev)
    })

    proc.stdout.on('data', (ev) => {
      console.log(`${ev}`)

      str += `${ev}`

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

  return { finalOutput: str, successful }
}
