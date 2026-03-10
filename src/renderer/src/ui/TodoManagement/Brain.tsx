import { useTM } from '@renderer/store/useTM'

export function Brain() {
  const brain = useTM((r) => r.brain)
  return (
    <>
      <div className=" whitespace-pre-wrap text-xs p-3">{brain}</div>
    </>
  )
}
