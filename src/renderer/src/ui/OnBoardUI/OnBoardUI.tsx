import {
  ArrowBigRight,
  ArrowDownRight,
  ArrowRightIcon,
  ArrowUpRight,
  EggIcon,
  LinkIcon,
  WineIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { navigate } from 'wouter/use-browser-location'

export function OnBoardUI() {
  let [spaces, setSpaces] = useState([])
  useEffect(() => {
    const controller = window.api.askAI(
      {
        route: 'listWorkspaces'
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)
        console.log(resp)
      }
    )

    controller.getDataAsync().then((data) => {
      setSpaces(data.workspaces)
    })
  }, [])

  return (
    <>
      <div className="w-full h-full bg-gray-200 from-[#bbc9ff] to-[#d58c25] bg-linear-[0deg] flex items-center justify-center">
        <div>
          <div className="text-white text-shadow-2xs text-[50px] mb-3 flex justify-center items-center mx-12">
            HyperEgg
          </div>
          <div className="text-white text-shadow-2xs text-center">
            {spaces.map((space) => {
              return (
                <div
                  className=" border p-2 rounded-lg cursor-pointer transition-colors hover:bg-[#6b46f2] hover:text-[#dbf9ff] select-none mb-3 flex justify-center items-center"
                  key={space.path}
                  onClick={() => {
                    //
                    console.log('on click')
                    navigate(`/workspace/${space.name}`)
                  }}
                >
                  {space.name} <ArrowUpRight className="ml-2"></ArrowUpRight>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
