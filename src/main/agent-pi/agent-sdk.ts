import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, ExecStep } from './subagents/getStep'
import { writeFile } from 'fs/promises'
import path from 'path'
import { readFile } from 'fs/promises'

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

    await writeFile(
      path.join(workspace, 'state.json'),
      JSON.stringify(
        {
          todo: nextStep.todo,
          multipleSteps: multipleSteps
        },
        null,
        '\t'
      )
    )

    if (
      nextStep?.todo.filter((r) => r.status === 'completed').length === nextStep?.todo.length &&
      nextStep.todo.length > 0
    ) {
      return
    }

    return await loopRun({
      multipleSteps: multipleSteps.slice().reverse().slice(0, 5).reverse(),
      step: nextStep
    })
  }

  let state = { multipleSteps: [], todo: [] }
  try {
    let stateStr = await readFile(path.join(workspace, 'state.json'), 'utf-8')
    state = JSON.parse(stateStr)
  } catch (e) {
    console.error(e)
  }

  await loopRun({
    multipleSteps: state.multipleSteps || [],
    step: {
      todo: state.todo || [],
      actionsToTake: []
    }
  })
}

//

//
