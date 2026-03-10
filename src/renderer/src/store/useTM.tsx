import { create } from 'zustand'

type Todo = {
  task: string
  status: 'pending' | 'working' | 'completed'
}
const getInit = (set, get) => {
  return {
    //
    //
    todos: [] as Todo[],
    status: ['pending', 'working', 'completed'] as any[]
    //
    //
  }
}

export type TMState = ReturnType<typeof getInit>

export const useTM = create<TMState>(getInit)
