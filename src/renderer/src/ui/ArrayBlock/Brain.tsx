import { useEffect, useRef } from 'react'
import { useArchApp } from './useArchApp'

export function Brain({ agentName = '' }) {
  const stream = useArchApp((r) => r['stream' + agentName]) || ''
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.scrollTop = ref.current.scrollHeight
      window.scrollTo(0, 9999)
    }
  }, [stream])

  return (
    <>
      <div
        className=" whitespace-pre-wrap text-xs p-3 w-full max-h-[500px] overflow-y-scroll"
        ref={ref}
      >
        {stream}
      </div>
    </>
  )
}
