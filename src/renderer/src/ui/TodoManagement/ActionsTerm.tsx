import { type Action, useTM } from '@renderer/store/useTM'

export function ActionsTerm() {
  const terminalCalls = useTM((r: any) => r.terminalCalls) as Action[]

  console.log('terminalCalls', terminalCalls)
  return (
    <>
      {/*  */}
      <div className="w-full mt-2 text-xs gap-2   ">
        {terminalCalls.map((eachAction, idx) => {
          return (
            <div className="mb-2 border rounded-2xl" key={`${eachAction.cmd}${idx}`}>
              <div className="p-2 bg-gray-100 m-2 border rounded-lg whitespace-pre-wrap">
                {`${eachAction.cmd}`.trim()}
              </div>
              <div className="p-2 bg-gray-100 m-2 border rounded-lg whitespace-pre-wrap">
                {`${eachAction.result}`.trim()}
              </div>
            </div>
          )
        })}
      </div>

      {/*  */}
    </>
  )
}
