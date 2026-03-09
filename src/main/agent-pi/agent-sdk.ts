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

    const workStep: WorkStep | null = await getStep({
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
  }

  if (checkAborted()) {
    return
  }

  await loopRun({
    lastStep: {
      activity: {
        action: 'think',
        thought: `Things will be okay.`
      },
      stop: false,
      memory: `let's do the task!`,
      nextStep: 'think about what to do.'
    }
  })
}

//
//
//
