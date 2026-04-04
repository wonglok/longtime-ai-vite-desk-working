// import { useEffect, useState } from 'react'
// import { useHome } from './useHome'
// import nprogress from 'nprogress'
import { CanvasGPU } from '../workspace/3d/CanvasGPU/CanvasGPU'
// import { RoomFX } from '../workspace/3d/RoomFX/RoomFX'
import { Environment, Gltf, OrbitControls, PerspectiveCamera } from '@react-three/drei'
// import { BloomPipeline } from '../workspace/3d/CanvasGPU/BloomPipeline'
import { EnvLoader } from '../workspace/3d/CanvasGPU/EnvLoader'
// import { toast } from 'sonner'
import hdr from '../../ui/workspace/3d/assets/factory.hdr?url'
import { PageSelectFolder } from './PageSelectFolder/PageSelectFolder'
import { useHome } from './useHome'
import { PageViewFiles } from './PageViewFiles/PageViewFiles'
import { Suspense, useEffect, useMemo } from 'react'
// import { CenterMe } from './ProcedureModules/CenterMe'
// import desk from './assets/room/desk-transformed.glb?url'

export function HyperHome({ workspaceName = '' }) {
  //

  useEffect(() => {
    useHome.setState({
      workspace: workspaceName
    })
  }, [workspaceName])

  let workspace = useHome((r) => r.workspace)

  return (
    <>
      <div className=" w-full h-full from-[#cbe9eb] to-[#4391be] bg-linear-120">
        {/* <div className="">Welcome Back! {name}</div> */}
        <CanvasGPU>
          <EnvLoader></EnvLoader>
          <Suspense fallback={null}>
            <Environment
              files={[`${hdr}`]}
              backgroundIntensity={0.5}
              environmentIntensity={0.5}
              background
            ></Environment>
          </Suspense>

          {workspace && <Pages></Pages>}
        </CanvasGPU>
      </div>
    </>
  )
}

function Pages({}) {
  let pageAt = useHome((r) => r.pageAt)
  let workspace = useHome((r) => r.workspace)
  let loadFolderConfig = useHome((r) => r.loadFolderConfig)

  useEffect(() => {
    //
    loadFolderConfig({})
    //
  }, [workspace])

  return (
    <>
      {pageAt === 'home' && <PageSelectFolder workspace={workspace}></PageSelectFolder>}
      {pageAt === 'view-files' && <PageViewFiles workspace={workspace}></PageViewFiles>}
    </>
  )
}
