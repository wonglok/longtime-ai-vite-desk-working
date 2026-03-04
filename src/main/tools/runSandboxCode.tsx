import { fork } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export async function runSandboxCode({ code }) {
  return new Promise((resolve, rejects) => {
    //
    const workerCode = `
  process.on('message', async (msg) => {
    console.log('Child received:', msg);

    ${code}

    process.send(await exec());
  });
`

    const filePath = path.join(process.cwd(), './temp-node.js')

    fs.writeFileSync(filePath, workerCode)

    const child = fork(filePath)

    // IPC Communication
    child.send('Start')
    child.on('message', (msg) => {
      console.log('Parent received:', msg)

      resolve(msg)
      child.kill() // Kill after receiving message

      fs.unlinkSync(filePath)
    })

    child.on('error', () => {
      rejects('error')
    })

    //
  })
}
