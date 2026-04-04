// import { useEffect, useState } from 'react'
// import { useHome } from './useHome'
// import nprogress from 'nprogress'
// import { CanvasGPU } from '../../workspace/3d/CanvasGPU/CanvasGPU'
// import { RoomFX } from '../../workspace/3d/RoomFX/RoomFX'
// import { Environment, Gltf, OrbitControls, PerspectiveCamera } from '@react-three/drei'
// import { BloomPipeline } from '../../workspace/3d/CanvasGPU/BloomPipeline'
// import { EnvLoader } from '../../workspace/3d/CanvasGPU/EnvLoader'
// import { toast } from 'sonner'
// import hdr from '../../../ui/workspace/3d/assets/factory.hdr?url'

// import { CenterMe } from './ProcedureModules/CenterMe'
// import desk from './assets/room/desk-transformed.glb?url'

import { FolderSelect } from './FolderSelect'
import { DeskMesh } from './DeskMesh'
import { Flex, Box } from '@react-three/flex'
import { useHome } from '../useHome'
import { GeneralButton } from './GeneralButton'
import { useEffect } from 'react'

export function PageSelectFolder({ workspace }) {
  useEffect(() => {
    //
    //
  }, [])

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

    console.log(ev)

    useHome.setState({
      pageAt: 'view-files'
    })
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

      {/*  */}
      <group position={[0, 1.0, 0.0]}>
        {/*  */}
        {/* @ts-ignore */}
        <Flex centerAnchor justifyContent="center" alignItems="center">
          {/* @ts-ignore */}
          <Box centerAnchor marginBottom={0.2}>
            <group position={[0, 0, 0]} onClick={onSelectFolder}>
              <GeneralButton
                title={'Select AI Folder'}
                bgNormal={'#fff'}
                bgHover={'#7fd956'}
                textNormal={'#000000'}
                textHover={'#034616'}
                width={6.5}
              ></GeneralButton>
            </group>
          </Box>

          {/* @ts-ignore */}
          <Box centerAnchor>
            <group position={[0, 0, 0.5]} onClick={onNextPage}>
              <GeneralButton
                title={'Next'}
                bgNormal={'#fff'}
                bgHover={'#7fd956'}
                textNormal={'#000000'}
                textHover={'#034616'}
                width={3}
              ></GeneralButton>
            </group>
          </Box>
        </Flex>
      </group>
    </>
  )
}
