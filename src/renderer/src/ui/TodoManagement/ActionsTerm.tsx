import { type Action, useTM } from '@renderer/store/useTM'

export function ActionsTerm() {
  const actionsToTake = useTM((r: any) => r.actionsToTake) as Action[]

  return (
    <>
      {/*  */}
      <div className="w-full h-[200px] gap-4 rounded-2xl ">
        {actionsToTake.map((eachAction, idx) => {
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
