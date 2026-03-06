import { app } from 'electron'
import { gatherContext } from './subagents/gatherContext'
import { takeAction } from './subagents/takeAction'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  //
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`

  onEvent({ type: 'side', text: `${inbound.appSpec}` })

  const context = await gatherContext({
    checkAborted: checkAborted,
    workspace: workspace,
    inbound: inbound,
    onEvent: ({ type, text }) => {
      onEvent({ type, text })
    }
  })

  onEvent({ type: 'side', text: `${context}` })

  const progressUpdate = await takeAction({
    checkAborted: checkAborted,
    workspace: workspace,
    inbound: inbound,
    context: context,
    onEvent: ({ type, text }) => {
      onEvent({ type, text })
    }
  })

  console.log(progressUpdate)
}
