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

    const execStep: ExecStep | null = await getStep({
      step: step,
      multipleSteps: multipleSteps,
      checkAborted: checkAborted,
      workspace: `${docs}/ai-home`,
      inbound: inbound,
      onEvent: (ev) => {
        onEvent(ev)
      }
    })

    if (!execStep) {
      return
    }

    onEvent({ type: 'todo', todo: execStep.todo })

    if (
      execStep?.todo.filter((r) => r.status === 'completed').length === execStep?.todo.length &&
      execStep.todo.length > 0
    ) {
      return
    }

    return await loopRun({ multipleSteps, step: execStep })
  }

  await loopRun({
    multipleSteps: [],
    step: {
      memory: `You love helping people.`,
      todo: [],
      terminalCommands: []
    }
  })
}

//
