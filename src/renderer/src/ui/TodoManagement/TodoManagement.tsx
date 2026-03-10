import { useTM } from '@renderer/store/useTM'

export function TodoManagement() {
  const todos = useTM((r) => r.todos)
  const status = useTM((r) => r.status)

  return (
    <>
      {/*  */}
      <div className="flex flex-row flex-wrap w-full h-[500px] gap-4 rounded-2xl ">
        {status.map((eStatus) => {
          let colorStyle = {
            pending: {
              title: `bg-blue-500 text-white rounded-lg `,
              task: `bg-blue-400 text-white rounded-lg `
            },
            working: {
              title: `bg-green-500 text-white rounded-lg `,
              task: `bg-green-400 text-white rounded-lg `
            },
            completed: {
              title: `bg-amber-500 text-white rounded-lg `,
              task: `bg-amber-400 text-white rounded-lg `
            }
          }
          let classy = colorStyle[eStatus]

          return (
            <div
              className="h-full rounded-2xl pt-3 bg-gray-100 shadow-[#a7a7a7] shadow-inner w-[300px] text-xs "
              key={`${eStatus}`}
            >
              <div
                className={`mx-2 px-2 py-2 text-center  flex items-center justify-center text-xl ${classy?.title}`}
                style={{ height: `50px` }}
              >
                {eStatus}
              </div>
              <div className="overflow-y-scroll w-full" style={{ height: `calc(100% - 50px)` }}>
                {todos
                  .filter((e) => e.status === eStatus)
                  .map((todo, i) => {
                    return (
                      <div className={`m-2 p-2 ${classy.task}`} key={todo.task + i}>
                        {todo.task}
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>

      {/*  */}
    </>
  )
}
