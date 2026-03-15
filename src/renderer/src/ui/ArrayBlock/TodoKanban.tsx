import { useArchApp } from './useArchApp'
// import { useEffect } from 'react'

export function TodoKanban({ agentName = '' }) {
  const todo = useArchApp((r) => r['todo' + agentName]) || []
  const status = useArchApp((r) => r.status)

  return (
    <>
      {/*  */}
      {todo?.length > 0 && (
        <div className="flex flex-row w-full h-[500px] gap-4 rounded-2xl ">
          {status.map((eStatus) => {
            let colorStyle = {
              pending: {
                displayName: 'Pending Task',
                title: `bg-blue-500 text-white rounded-lg `,
                task: `bg-blue-400 text-white rounded-lg `
              },
              ['in-progress']: {
                displayName: 'In Progress',
                title: `bg-green-500 text-white rounded-lg `,
                task: `bg-green-400 text-white rounded-lg `
              },
              completed: {
                displayName: 'Completed',
                title: `bg-amber-500 text-white rounded-lg `,
                task: `bg-amber-400 text-white rounded-lg `
              }
            }
            let currentColumn = colorStyle[eStatus]

            return (
              <div
                className="h-full rounded-2xl pt-3 bg-gray-100 shadow-[#585858] w-[33.33%] text-xs "
                key={`${eStatus}`}
              >
                <div
                  className={`mx-2 px-2 py-2 text-center  flex items-center justify-center text-xl ${currentColumn?.title} shadow shadow-[#ffffff]`}
                  style={{ height: `50px` }}
                >
                  {currentColumn.displayName}
                </div>
                <div
                  className="overflow-y-scroll w-full rounded-2xl"
                  style={{ height: `calc(100% - 50px - 20px)`, marginTop: '10px' }}
                >
                  {todo
                    .filter((e) => e.status === eStatus)
                    .map((todo, i) => {
                      return (
                        <div className={`m-2 p-2 ${currentColumn.task}`} key={todo.task + i}>
                          {todo.task}
                        </div>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/*  */}
    </>
  )
}
