import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import { writeCode, ExecStep } from './subagents/writeCode'
import { writeFile } from 'fs/promises'
import path from 'path'
import { readFile } from 'fs/promises'

const FailCounter = {}
export const runAgent = async ({ plan, checkAborted, onEvent, inbound, randID }) => {
  FailCounter[randID] = FailCounter[randID] || 0

  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/apps/${inbound.appName}`
  await makeDirectory(workspace)

  if (checkAborted()) {
    return
  }

  const loopRun = async ({ memory, step }: { memory: any[]; step: ExecStep }) => {
    if (FailCounter[randID] >= 50) {
      onEvent({ type: 'error', error: 'Failed too many times.' })
      return
    }
    if (checkAborted()) {
      return
    }

    const nextStep: ExecStep | null = await writeCode({
      plan: plan,
      step: step,
      checkAborted: checkAborted,
      workspace: `${workspace}`,
      inbound: inbound,
      memory: memory,
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
      return await loopRun({ step: step, memory })
    }

    await writeFile(
      path.join(workspace, 'ai-memory', 'state.json'),
      JSON.stringify(
        {
          step: nextStep,
          memory: memory
        },
        null,
        '\t'
      )
    )

    // if (
    //   nextStep?.todo.filter((r) => r.status === 'completed').length === nextStep?.todo.length &&
    //   nextStep.todo.length > 0
    // ) {
    //   return
    // }

    return await loopRun({
      step: nextStep,
      memory
    })
  }

  let state = {
    memory: [],
    step: {
      whatToDoNow: '',
      terminalCalls: [],
      whatTodoNext: '',
      filesToBeWritten: []
    } satisfies ExecStep
  }

  try {
    let stateStr = await readFile(path.join(workspace, 'ai-memory', 'state.json'), 'utf-8')
    state = JSON.parse(stateStr)
  } catch (e) {
    // console.error(e)
  }

  await loopRun({
    step: state.step,
    memory: state.memory
  })
}
