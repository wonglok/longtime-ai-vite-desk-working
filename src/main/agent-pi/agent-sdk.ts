import { app } from 'electron'
import { gatherContext } from './subagents/gatherContext'
import { takeAction } from './subagents/takeAction'
import { reviewAction } from './subagents/reviewAction'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  //
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  await gatherContext({
    checkAborted: checkAborted,
    workspace: workspace,
    inbound: inbound,
    onEvent: ({ type, text }) => {
      onEvent({ type, text })
    }
  })

  onEvent({ type: 'notice', text: `Taking Action` })

  await takeAction({
    checkAborted: checkAborted,
    workspace: workspace,
    inbound: inbound,
    onEvent: ({ type, text }) => {
      onEvent({ type, text })
    }
  })

  onEvent({ type: 'notice', text: `Review Action` })

  await reviewAction({
    checkAborted: checkAborted,
    workspace: workspace,
    inbound: inbound,
    onEvent: ({ type, text }) => {
      onEvent({ type, text })
    }
  })
}
