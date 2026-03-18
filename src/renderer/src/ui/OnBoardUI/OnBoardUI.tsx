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
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Environment, OrbitControls, PerspectiveCamera, useEnvironment } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { AuraEffect } from '@renderer/effects/AuraEffect'
import { SearchBar } from '@renderer/effects/SearchBar'
import { Suspense } from 'react'
import { CanvasGPU } from '../workspace/3d/CanvasGPU/CanvasGPU'
import { DiamondCompos } from '../workspace/3d/DiamondTSL/DiamondComponent'

function DiamondCanvas({}) {
  //

  return (
    <>
      <div className="w-full h-full relative">
        <CanvasGPU>
          <Suspense fallback={null}>
            <Content></Content>
          </Suspense>
        </CanvasGPU>
      </div>
    </>
  )
}

function Content() {
  //

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0.0, 2.5]}
        rotation={[0.0 * Math.PI, 0, 0]}
      ></PerspectiveCamera>
      <group>
        <DiamondCompos></DiamondCompos>
      </group>
    </>
  )
}

//

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
      <div className=" absolute top-0 left-0 w-full h-full bg-gray-200 from-[#bfffff] to-[#ffda7e] bg-linear-[0deg] ">
        <DiamondCanvas></DiamondCanvas>
      </div>
      <div className=" absolute top-0 left-0 w-full h-full">
        <div className="w-full h-full flex items-center justify-center  relative">
          <div>
            <div className="text-white  text-shadow-2xs text-[50px] mb-3 flex justify-center items-center mx-12">
              HyperEgg
            </div>
            <div className="text-white  text-shadow-2xs text-center">
              {spaces.map((space) => {
                return (
                  <div
                    className=" border p-2 rounded-lg text-#ffffff bg-[#000000]/20 cursor-pointer transition-colors hover:bg-[#6b46f2] hover:text-[#dbf9ff] select-none mb-3 flex justify-center items-center"
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
      </div>
    </>
  )
}
