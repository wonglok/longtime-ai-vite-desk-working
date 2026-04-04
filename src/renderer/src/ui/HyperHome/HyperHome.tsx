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
import { FolderSelect } from './ProcedureModules/FolderSelect'
import { DeskMesh } from './ProcedureModules/DeskMesh'
import { Flex, Box } from '@react-three/flex'
import { NextButton, SelectButton } from './ProcedureModules/Buttons'
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
            target={[0, 1.5, 0]}
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

function PageSelectFolder({ workspace }) {
  const onSelectFolder = (ev) => {
    ev.stopPropagation()

    const controller = window.api.askAI(
      {
        route: 'selectWorkspaceFolder',

        workspace: workspace
      },
      (stream) => {
        const resp = JSON.parse(stream)

        console.log('selectWorkspaceFolder', resp)
      }
    )

    controller.getDataAsync().then(() => {})
  }

  const onNextPage = (ev) => {
    ev.stopPropagation()

    //

    const controller = window.api.askAI(
      {
        route: 'selectWorkspaceFolder',

        workspace: workspace
      },
      (stream) => {
        const resp = JSON.parse(stream)

        console.log('selectWorkspaceFolder', resp)
      }
    )

    controller.getDataAsync().then(() => {})
  }

  return (
    <>
      <group
        scale={0.75}
        position={[0, 2, 0]}
        //
        onClick={onSelectFolder}
      >
        <FolderSelect></FolderSelect>
      </group>

      <DeskMesh></DeskMesh>

      <CallToActions
        //
        onSelectFolder={onSelectFolder}
        onNextPage={onNextPage}
      ></CallToActions>
    </>
  )
}

const FlexBox: any = Flex
const Div: any = Box

const CallToActions = ({ onSelectFolder, onNextPage }) => (
  <group position={[0, 1.0, 0.0]}>
    <FlexBox centerAnchor justifyContent="center" alignItems="center">
      <Div centerAnchor marginBottom={0.2}>
        <group position={[0, 0, 0]} onClick={onSelectFolder}>
          <SelectButton></SelectButton>
        </group>
      </Div>
      <Div centerAnchor>
        <group position={[0, 0, 0.5]} onClick={onNextPage}>
          <NextButton></NextButton>
        </group>
      </Div>
    </FlexBox>
  </group>
)
