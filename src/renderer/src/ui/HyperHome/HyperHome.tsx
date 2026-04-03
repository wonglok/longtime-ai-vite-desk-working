import { useEffect, useState } from 'react'
import { useHome } from './useHome'
import nprogress from 'nprogress'
import { CanvasGPU } from '../workspace/3d/CanvasGPU/CanvasGPU'
import { RoomFX } from '../workspace/3d/RoomFX/RoomFX'
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { BloomPipeline } from '../workspace/3d/CanvasGPU/BloomPipeline'
import { EnvLoader } from '../workspace/3d/CanvasGPU/EnvLoader'
// import { toast } from 'sonner'
import hdr from '../../ui/workspace/3d/assets/factory.hdr?url'
import { FileItem } from './ProcedureModules/FileItem'

export function HyperHome({ name = '' }) {
  const seed = useHome((r) => r.seed)
  const baseURL = useHome((r) => r.baseURL)
  const appModel = useHome((r) => r.appModel)
  const appName = useHome((r) => r.appName)
  const appUserPrompt = useHome((r) => r.appUserPrompt)
  const apiKey = useHome((r) => r.apiKey)

  const [stopFunc, setStop] = useState<any>(() => {
    return () => {}
  })

  useEffect(() => {
    return () => {
      stopFunc()
    }
  }, [stopFunc])

  const onClick = async () => {
    const controller = window.api.askAI(
      {
        route: 'readWorkspaceFiles',

        baseURL: baseURL || `http://localhost:1234/v1`,

        apiKey: apiKey || 'nono',

        workspace: name,

        model: `${appModel}`,

        seed: `${seed}`,

        appName: `${appName}`,

        appUserPrompt: `${appUserPrompt}`
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        console.log(resp)

        if (resp.start) {
          nprogress.start()
        }
        if (resp.done) {
          nprogress.done()
        }

        if (resp.files) {
          useHome.setState({ files: resp.files })
        }
      }
    )

    controller.getDataAsync().then(() => {
      stopFunc()
    })

    setStop((oldStop) => {
      if (typeof oldStop === 'function') {
        oldStop()
      }

      return () => {
        controller.abort()
      }
    })
  }

  useEffect(() => {
    onClick()
  }, [])

  return (
    <>
      <div className=" w-full h-full from-[#cbe9eb] to-[#4391be] bg-linear-120">
        {/* <div className="">Welcome Back! {name}</div> */}
        <CanvasGPU>
          <OrbitControls makeDefault object-position={[0, 0, 6]}></OrbitControls>
          <EnvLoader></EnvLoader>
          {/* <Environment
            files={[`${hdr}`]}
            backgroundIntensity={0.5}
            environmentIntensity={0.5}
            background
          ></Environment> */}
          <FileItem></FileItem>
        </CanvasGPU>
      </div>
    </>
  )
}

//
