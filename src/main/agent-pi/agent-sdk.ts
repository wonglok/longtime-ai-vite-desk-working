import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, ExecStep } from './subagents/getStep'

export const runAgent = async ({ checkAborted, onEvent, inbound }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  if (checkAborted()) {
    return
  }

  const loopRun = async ({
    multipleSteps,
    step
  }: {
    multipleSteps: ExecStep[]
    step: ExecStep
  }) => {
    //
    if (checkAborted()) {
      return
    }

    multipleSteps.push(step)

    const nextStep: ExecStep | null = await getStep({
      step: step,
      multipleSteps: multipleSteps,
      checkAborted: checkAborted,
      workspace: `${workspace}`,
      inbound: inbound,
      onEvent: (ev) => {
        onEvent(ev)
      }
    })

    if (!nextStep) {
      return await loopRun({ multipleSteps, step: step })
    }

    onEvent({ type: 'todo', todo: nextStep.todo })
    onEvent({ type: 'multipleSteps', multipleSteps: multipleSteps })

    if (
      nextStep?.todo.filter((r) => r.status === 'completed').length === nextStep?.todo.length &&
      nextStep.todo.length > 0
    ) {
      return
    }

    return await loopRun({ multipleSteps, step: nextStep })
  }

  console.log(inbound.multipleSteps)
  await loopRun({
    multipleSteps: inbound.multipleSteps || [],
    step: {
      // memory: `You love helping people building their apps.`,
      todo: [],
      actionsToTake: []
    }
  })
}

//

//
