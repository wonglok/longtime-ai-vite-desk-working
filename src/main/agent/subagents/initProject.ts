import { spawn } from 'node:child_process'

export const initProject = async ({ workspace }) => {
  await new Promise(async (resolve) => {
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

  return
}
