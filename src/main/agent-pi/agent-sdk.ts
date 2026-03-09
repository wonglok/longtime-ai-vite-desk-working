import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, WorkStep } from './subagents/getStep'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  const loopRun = async ({ step }: { step: WorkStep }) => {
    const workStep: WorkStep | null = await getStep({
      step: step,
      checkAborted: checkAborted,
      workspace: `${docs}/ai-home/`,
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
    if (checkAborted()) {
      return
    }

    return await loopRun({ step: workStep })
  }

  await loopRun({
    step: {
      end: false,
      memory: ``,
      todo: [
        {
          task: `my user was having an app idea or something. let's see if i build something already or not`,
          done: false
        }
      ]
    }
  })
}

//
