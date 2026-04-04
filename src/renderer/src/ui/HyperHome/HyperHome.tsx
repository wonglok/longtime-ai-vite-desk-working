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
import { FolderSelect } from './PageSelectFolder/FolderSelect'
import { DeskMesh } from './PageSelectFolder/DeskMesh'
import { Flex, Box } from '@react-three/flex'
import { NextButton, SelectButton } from './PageSelectFolder/Buttons'
import { PageSelectFolder } from './PageSelectFolder/PageSelectFolder'
// import { CenterMe } from './ProcedureModules/CenterMe'
// import desk from './assets/room/desk-transformed.glb?url'

export function HyperHome({ workspaceName = '' }) {
  return (
    <>
      <div className=" w-full h-full from-[#cbe9eb] to-[#4391be] bg-linear-120">
        {/* <div className="">Welcome Back! {name}</div> */}
        <CanvasGPU>
          <OrbitControls
            makeDefault
            object-position={[0, 3.5, 3.5]}
            target={[0, 2, 0]}
            minAzimuthAngle={-0.25 * Math.PI}
            maxAzimuthAngle={0.25 * Math.PI}
            maxPolarAngle={0.5 * Math.PI}
            minPolarAngle={0.25 * Math.PI}
          ></OrbitControls>

          <EnvLoader></EnvLoader>

          <Environment
            files={[`${hdr}`]}
            backgroundIntensity={0.5}
            environmentIntensity={0.5}
            background
          ></Environment>

          {/* <group scale={2.5}>
            <Gltf src={desk}></Gltf>
          </group> */}

          <PageSelectFolder workspace={workspaceName}></PageSelectFolder>
        </CanvasGPU>
      </div>
    </>
  )
}
