import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, WorkStep } from './subagents/getStep'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  let loopRun = async ({ lastStep }: { lastStep: WorkStep }) => {
    if (checkAborted()) {
      return
    }

    const workStep: WorkStep = await getStep({
      lastStep: lastStep,
      checkAborted: checkAborted,
      workspace: workspace,
      inbound: inbound,
      onEvent: ({ type, text }) => {
        onEvent({ type, text })
      }
    })

    if (!workStep) {
      return
    }
    if (workStep?.stop) {
      return
    }

    return await loopRun({ lastStep: workStep })

    // await gatherContext({
    //   checkAborted: checkAborted,
    //   workspace: workspace,
    //   inbound: inbound,
    //   onEvent: ({ type, text }) => {
    //     onEvent({ type, text })
    //   }
    // })

    // if (checkAborted()) {
    //   return
    // }

    // onEvent({ type: 'notice', text: `Taking Action` })

    // const schedule = await takeAction({
    //   loopRun: loopRun,
    //   checkAborted: checkAborted,
    //   workspace: workspace,
    //   inbound: inbound,
    //   onEvent: ({ type, text }) => {
    //     onEvent({ type, text })
    //   }
    // })

    // console.log('schedule.scheduleWork', schedule.scheduleWork)
    // if (schedule.scheduleWork) {
    //   await loopRun()
    // }
  }

  if (checkAborted()) {
    return
  }

  await loopRun({
    lastStep: {
      activity: {
        action: 'think',
        thought: `let's explore what should i do next.`
      },
      stop: false,
      memory: `let's do the task!`
    }
  })
}

//
//
//
