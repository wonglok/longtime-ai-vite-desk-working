import { type Action, useTM } from '@renderer/store/useTM'

export function ActionsTerm() {
  const terminalCalls = useTM((r: any) => r.terminalCalls) as Action[]

  console.log('terminalCalls', terminalCalls)
  return (
    <>
      {/*  */}
      <div className="w-full text-xs gap-4 rounded-2xl ">
        {terminalCalls.map((eachAction, idx) => {
          return (
            <div className="p-2 m-2 border" key={`${eachAction.cmd}${idx}`}>
              <div className="p-2 bg-gray-100 m-2 border whitespace-pre-wrap">
                {`${eachAction.cmd}`.trim()}
              </div>
              <div className="p-2 bg-gray-100 m-2 border whitespace-pre-wrap">
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
