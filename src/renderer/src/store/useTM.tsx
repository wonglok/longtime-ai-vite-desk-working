import { create } from 'zustand'

export type Todo = {
  task: string
  status: 'pending' | 'in-progress' | 'completed'
}

export type Action = {
  cmd: string
  result: string
}

const getInit = (set, get) => {
  return {
    //
    //
    brain: '' as string,
    terminalCalls: [] as Action[],
    todos: [] as Todo[],
    status: ['pending', 'in-progress', 'completed'] as any[]
    //
    //
  }
}

export type TMState = Awaited<ReturnType<typeof getInit>>

export const useTM = create<TMState>(getInit)
