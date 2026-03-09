import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, WorkStep } from './subagents/getStep'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  let loopRun = async ({ step }: { step: WorkStep }) => {
    if (checkAborted()) {
      return
    }

    const workStep: WorkStep | null = await getStep({
      step: step,
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
    if (workStep?.end) {
      return
    }

    return await loopRun({ step: workStep })
  }

  if (checkAborted()) {
    return
  }

  await loopRun({
    step: {
      end: false,
      currentThought: ``,
      longTermMemory: ``,
      todo: `my user was having an app idea or something. let's see if i made something already or not.`
    }
  })
}

//
//
//
