import { type Action, useTM } from '@renderer/store/useTM'

export function ActionsTerm() {
  const actions = useTM((r: any) => r.actions) as Action[]

  return (
    <>
      {/*  */}
      <div className="w-full h-[500px] gap-4 rounded-2xl ">
        {actions.map((eachAction, idx) => {
          return (
            <div key={`${eachAction.cmd}${idx}`}>
              <div>${eachAction.cmd}</div>
              <div>${eachAction.result}</div>
            </div>
          )
        })}
      </div>

      {/*  */}
    </>
  )
}
