import { Merged } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, DoubleSide, Mesh } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

export function FileItem() {
  let box = useMemo(() => {
    let geo = new RoundedBoxGeometry(1, 1.3, 0.05, 7, 0.15 / 2)
    let mat = new MeshPhysicalNodeMaterial({
      //
      roughness: 0,
      metalness: 0,
      color: '#78660e',
      side: DoubleSide,
      transmission: 1,
      emissive: new Color('#ffd500'),
      emissiveIntensity: 0.5
    })

    let box = new Mesh(geo, mat)

    return box
  }, [])

  return (
    <>
      <Merged meshes={[box]}>
        {(MyBox) => {
          let planes = []
          for (let i = 0; i < 20 - 1; i++) {
            planes.push(<EachBox MyBox={MyBox} key={'plane' + i} n={20} i={i}></EachBox>)
          }

          return <>{planes}</>
        }}
      </Merged>
    </>
  )
}

function EachBox({ i, n, MyBox }) {
  let ref = useRef<any>(null)

  useFrame((_, dt) => {
    ref.current.rotation.z += dt * (i / n)
  })
  return (
    <MyBox
      ref={ref}
      rotation={[Math.PI * -0.5, 0, Math.PI * 0.01 * i]}
      position={[0, 0.1 * i, 0]}
      color="#ffef92"
    />
  )
}
