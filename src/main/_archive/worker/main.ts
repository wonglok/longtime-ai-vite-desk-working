import { utilityProcess, MessageChannelMain } from 'electron'
import forkPath from './fork?modulePath'

export function runProcess() {
  //
  const { port1, port2 } = new MessageChannelMain()

  const child = utilityProcess.fork(forkPath)
  child.postMessage({ message: 'hello' }, [port1])

  port2.on('message', (e) => {
    console.log(`Message from [child]: ${e.data}`)
  })

  port2.start()
  port2.postMessage('hello')

  return () => {
    child.kill()
    port1.close()
    port2.close()
  }
}
