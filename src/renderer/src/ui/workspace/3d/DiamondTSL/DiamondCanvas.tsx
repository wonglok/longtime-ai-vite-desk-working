import { Suspense, useRef } from 'react'
import { CanvasGPU } from '../CanvasGPU/CanvasGPU'
import { DiamondCompos } from './DiamondComponent'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Timer } from 'three'
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
        <Spinner>
          <DiamondCompos></DiamondCompos>
        </Spinner>
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

function Spinner({ children }) {
  let clock = new Timer()
  let ref = useRef<any>(null)
  useFrame((_) => {
    clock.update(performance.now())
    let time = clock.getElapsed()
    let delta = clock.getDelta()
    ref.current.rotation.y += delta / 5
    ref.current.rotation.x = Math.sin(time * 2) * 0.1
    ref.current.rotation.z = Math.cos(time * 2) * 0.1
  })

  return (
    <>
      <group ref={ref}>
        {/*  */}
        {children}
      </group>
    </>
  )
}
