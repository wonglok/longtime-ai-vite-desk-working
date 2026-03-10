import { useTM } from '@renderer/store/useTM'
import { useEffect, useRef } from 'react'

export function Brain() {
  const brain = useTM((r) => r.brain)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [brain])

  return (
    <>
      <div
        className=" whitespace-pre-wrap text-xs p-3 w-full h-[150px] overflow-y-scroll"
        ref={ref}
      >
        {brain}
      </div>
    </>
  )
}
