import { type Action, useTM } from '@renderer/store/useTM'

export function ActionsTerm() {
  const actionsToTake = useTM((r: any) => r.actionsToTake) as Action[]

  console.log('actionsToTake', actionsToTake)
  return (
    <>
      {/*  */}
      <div className="w-full text-xs gap-4 rounded-2xl ">
        {actionsToTake.map((eachAction, idx) => {
          return (
            <div className="p-2 m-2 border" key={`${eachAction.cmd}${idx}`}>
              <div className="p-1 m-1 border">${eachAction.cmd}</div>
              <div className="p-1 m-1 border">${eachAction.result}</div>
            </div>
          )
        })}
      </div>

      {/*  */}
    </>
  )
}
