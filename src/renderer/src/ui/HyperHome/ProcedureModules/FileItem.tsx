import { Merged, useGLTF } from '@react-three/drei'
import { useFrame, useGraph } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, DoubleSide, Mesh } from 'three'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import folder from '../assets/smart-folder.glb?url'
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js'
export function FileItem() {
  let box = useMemo(() => {
    let geo = new RoundedBoxGeometry(1, 1.5, 0.5, 7, 0.5)

    geo.translate(0, 2, 0)
    geo.scale(1, 1, 0.1)

    let mat = new MeshPhysicalNodeMaterial({
      //
      roughness: 0,
      metalness: 0,
      color: '#ffffff',
      vertexColors: true,
      side: DoubleSide,
      transmission: 1
      // emissive: new Color('#000000'),
      // emissiveIntensity: 0.5
    })

    let box = new Mesh(geo, mat)

    return box
  }, [])

  const glb = useGLTF(`${folder}`)
  const { nodes } = useGraph(glb.scene)

  let mat = new MeshPhysicalNodeMaterial({
    //
    roughness: 0,
    metalness: 0,
    color: '#f7cb3c',
    emissive: '#5f5125',
    vertexColors: true,
    side: DoubleSide
    // emissive: new Color('#000000'),
    // emissiveIntensity: 0.5
  })

  return (
    <>
      <group rotation={[0, 0, 0]}>
        <Merged
          meshes={{
            //

            ['folder-front']: new Mesh(nodes['folder-front'].geometry, mat),
            ['folder-back']: new Mesh(nodes['folder-back'].geometry, mat),
            box: box
          }}
        >
          {(insts) => {
            let Back = insts['folder-back']
            let Front = insts['folder-front']
            let Box = insts['box']

            let planes = []

            for (let i = -3; i < 3; i++) {
              planes.push(<EachBox MyBox={Box} key={'plane' + i} n={6} i={i}></EachBox>)
            }

            return (
              <>
                <Front></Front>
                <Back></Back>

                {planes}
              </>
            )
          }}
        </Merged>
      </group>
    </>
  )
}

function EachBox({ i, n, MyBox }) {
  let ref = useRef<any>(null)

  // useFrame((_, dt) => {
  //   ref.current.rotation.z += dt * (i / n)
  // })
  return (
    <MyBox
      ref={ref}
      rotation={[0.1, 0, Math.PI * 0.05 * i]}
      position={[0, 0.1 * i, i * 0.05]}
      color={new Color('#ff0000').offsetHSL(i / n, 0, 0)}
    />
  )
}
