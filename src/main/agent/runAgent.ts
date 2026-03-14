import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep } from './subagents/getStep'

const FailCounter = {}
export const runAgent = async ({ checkAborted, onEvent, inbound, randID }) => {
  FailCounter[randID] = FailCounter[randID] || 0

  const docs = app.getPath('documents')
  const project = `${docs}/ai-home/apps/${inbound.folder}`
  await makeDirectory(project)

  if (checkAborted()) {
    return
  }
  if (FailCounter[randID] >= 50) {
    onEvent({ type: 'error', error: 'Failed too many times.' })
    return
  }

  await getStep({
    checkAborted: checkAborted,
    project: project,
    inbound: inbound,
    onEvent: (ev) => {
      onEvent(ev)
    }
  })
}

//

//
