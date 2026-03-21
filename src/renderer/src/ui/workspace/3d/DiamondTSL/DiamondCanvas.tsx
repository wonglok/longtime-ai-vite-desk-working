import { Suspense } from 'react'
import { CanvasGPU } from '../CanvasGPU/CanvasGPU'
import { DiamondCompos } from './DiamondComponent'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
// import { BloomPipeline } from '../CanvasGPU/BloomPipeline'

export function DiamondCanvas({}) {
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

  //
  return (
    <>
      <group>
        <DiamondCompos></DiamondCompos>
      </group>

      <Suspense fallback={null}>
        <PerspectiveCamera
          makeDefault
          position={[0, 0.0, 2]}
          rotation={[0.0 * Math.PI, 0, 0]}
        ></PerspectiveCamera>
        <OrbitControls object-position={[0, 0.0, 2]} makeDefault></OrbitControls>

        {/* <BloomPipeline></BloomPipeline> */}
      </Suspense>
    </>
  )
}
