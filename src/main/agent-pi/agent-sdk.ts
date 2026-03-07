import { app } from 'electron'
import { gatherContext } from './subagents/gatherContext'
import { takeAction } from './subagents/takeAction'
import { makeDirectory } from 'make-dir'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  let loopRun = async () => {
    await gatherContext({
      checkAborted: checkAborted,
      workspace: workspace,
      inbound: inbound,
      onEvent: ({ type, text }) => {
        onEvent({ type, text })
      }
    })

    onEvent({ type: 'notice', text: `Taking Action` })

    const schedule = await takeAction({
      loopRun: loopRun,
      checkAborted: checkAborted,
      workspace: workspace,
      inbound: inbound,
      onEvent: ({ type, text }) => {
        onEvent({ type, text })
      }
    })

    console.log('schedule.scheduleWork', schedule.scheduleWork)
    if (schedule.scheduleWork) {
      await loopRun()
    }
  }

  await loopRun()
}

//
//
//
