import { useArchApp } from './useArchApp'

export function Term() {
  const terminalWindow = useArchApp((r) => r.terminalWindow)
  return (
    <div className=" bg-gray-100 rounded-xl p-2">
      <div className="text-xs p-2 rounded-lg border bg-white">{terminalWindow}</div>
    </div>
  )
}
