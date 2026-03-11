import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, ExecStep } from './subagents/getStep'
import { writeFile } from 'fs/promises'
import path from 'path'
import { readFile } from 'fs/promises'

const FailCounter = {}
export const runAgent = async ({ checkAborted, onEvent, inbound, randID }) => {
  FailCounter[randID] = FailCounter[randID] || 0

  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  onEvent({ type: 'notice', text: `Preparing Cotnext:\n${inbound.appSpec}` })

  if (checkAborted()) {
    return
  }

  const loopRun = async ({
    executionHistory,
    step
  }: {
    executionHistory: ExecStep[]
    step: ExecStep
  }) => {
    //
    if (checkAborted()) {
      return
    }

    executionHistory.push(step)

    const nextStep: ExecStep | null = await getStep({
      step: step,
      executionHistory: executionHistory,
      checkAborted: checkAborted,
      workspace: `${workspace}`,
      inbound: inbound,
      onEvent: (ev) => {
        onEvent(ev)
      }
    })

    if (FailCounter[randID] >= 50) {
      onEvent({ type: 'error', error: 'Failed too many times.' })
      return
    }

    if (!nextStep) {
      FailCounter[randID] = FailCounter[randID] + 1
      return await loopRun({ executionHistory, step: step })
    }

    onEvent({ type: 'todo', todo: nextStep.todo })
    onEvent({ type: 'executionHistory', executionHistory: executionHistory })

    await writeFile(
      path.join(workspace, 'state.json'),
      JSON.stringify(
        {
          nextStep: nextStep,
          executionHistory: executionHistory
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
      executionHistory: executionHistory.slice().reverse().slice(0, 5).reverse(),
      step: nextStep
    })
  }

  let state = {
    executionHistory: [],
    nextStep: {
      thought: `let's get to work.`,
      todo: [],
      terminalCalls: []
    }
  }

  try {
    let stateStr = await readFile(path.join(workspace, 'state.json'), 'utf-8')
    state = JSON.parse(stateStr)
  } catch (e) {
    console.error(e)
  }

  await loopRun({
    executionHistory: state.executionHistory,
    step: state.nextStep
  })
}

//

//
