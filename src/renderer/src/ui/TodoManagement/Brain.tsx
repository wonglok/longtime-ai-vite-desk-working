import { useTM } from '@renderer/store/useTM'
import { useEffect, useRef } from 'react'

export function Brain() {
  const stream = useTM((r) => r.stream)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [stream])

  return (
    <>
      <div className=" whitespace-pre-wrap text-xs p-3 w-full overflow-y-scroll" ref={ref}>
        {stream}
      </div>
    </>
  )
}
