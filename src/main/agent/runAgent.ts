import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { getStep, ExecStep, TodoType } from './subagents/getStep'
import { writeFile } from 'fs/promises'
import path from 'path'
import { readFile } from 'fs/promises'

const FailCounter = {}
export const runAgent = async ({ checkAborted, onEvent, inbound, randID }) => {
  FailCounter[randID] = FailCounter[randID] || 0

  const docs = app.getPath('documents')
  // const workspace = `${docs}/ai-home`
  const project = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(project)

  if (checkAborted()) {
    return
  }
  if (FailCounter[randID] >= 50) {
    onEvent({ type: 'error', error: 'Failed too many times.' })
    return
  }

  const loopRun = async ({ executionHistory }: { executionHistory: ExecStep[] }) => {
    if (FailCounter[randID] >= 50) {
      onEvent({ type: 'error', error: 'Failed too many times.' })
      return
    }
    if (checkAborted()) {
      return
    }

    const nextStep: ExecStep | null = await getStep({
      executionHistory: executionHistory,
      checkAborted: checkAborted,
      // workspace: `${workspace}`,
      project: project,
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
      return await loopRun({ executionHistory })
    }

    executionHistory.push(nextStep)

    onEvent({ type: 'todo', todo: nextStep.todo })
    onEvent({ type: 'executionHistory', executionHistory: executionHistory })

    await writeFile(
      path.join(project, 'state.json'),
      JSON.stringify(
        {
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
      executionHistory: executionHistory.slice()
      //.reverse().slice(0, 3).reverse()
    })
  }

  let state = {
    executionHistory: [
      {
        thought: `good morning! let's see how we can help the user.`,
        todo: [
          {
            task: `let figure out todo list.`,
            status: 'active'
          }
        ] satisfies TodoType[],
        terminalCalls: []
      }
    ]
  }

  try {
    let stateStr = await readFile(path.join(project, 'state.json'), 'utf-8')
    state = JSON.parse(stateStr)
  } catch (e) {
    console.error(e)
  }

  onEvent({
    type: 'todo',
    todo: state.executionHistory[0].todo
  })

  await loopRun({
    executionHistory: state.executionHistory
  })
}

//

//
