import { Center, Merged, Text3D, useGLTF } from '@react-three/drei'
import { extend, InstanceProps, useFrame, useGraph } from '@react-three/fiber'
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Color, ColorRepresentation, DoubleSide, Mesh, Object3D } from 'three'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import folder from '../assets/smart-folder.glb?url'
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js'
import { helvetica } from './helvetica'

const roundedGeo = new RoundedBoxGeometry(6.5, 1, 1, 7, 1 / 4)

export function FolderSelect() {
  const glb = useGLTF(`${folder}`)
  const { nodes }: { nodes: Record<string, Mesh> & any } = useGraph(glb.scene)

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

  let mat = useMemo(() => {
    return new MeshPhysicalNodeMaterial({
      roughness: 0,
      metalness: 0,
      color: '#f7cb3c',
      emissive: '#b09129',
      vertexColors: true,
      side: DoubleSide
    })
  }, [])

  return (
    <>
      <group rotation={[0, 0, 0]}>
        <Merged
          onLostPointerCapture={(ev) => {
            ev.stopPropagation()
          }}
          meshes={{
            ['folder-front']: new Mesh(nodes['folder-front'].geometry, mat),
            ['folder-back']: new Mesh(nodes['folder-back'].geometry, mat),
            ['box']: box
          }}
        >
          {(instances) => {
            let Back = instances['folder-back']
            let Front = instances['folder-front']
            let Box = instances['box']

            let files = []
            for (let i = -5; i < 5; i++) {
              files.push(<EachPlane Compo={Box} key={'plane' + i} n={6} i={i}></EachPlane>)
            }

            return (
              <>
                <Front></Front>
                <Back></Back>

                {files}
              </>
            )
          }}
        </Merged>

        <group position={[0, -0.65, 0]} rotation={[-0.25, 0, 0]}>
          <group position={[0, 0, -0.05]}>
            <CenterMe>
              <mesh geometry={roundedGeo} scale={[1, 1, 0.1]}>
                <meshStandardMaterial
                  roughness={0}
                  metalness={1}
                  color={'#3c3c3c'}
                ></meshStandardMaterial>
              </mesh>
            </CenterMe>
          </group>

          <CenterMe>
            <Text3D size={0.5} height={0.05} font={helvetica as any}>
              {`Select your folder`}

              <meshStandardMaterial emissive={'#ffffff'}></meshStandardMaterial>
            </Text3D>
          </CenterMe>
        </group>
      </group>
    </>
  )
}

function CenterMe({ children }) {
  let [key, setKey] = useState('123')

  useEffect(() => {
    setKey(Math.random() + '')
  }, [children])

  return <Center key={key}>{children}</Center>
}

function EachPlane({
  i,
  n,
  Compo
}: {
  i: number
  n: number
  Compo: FC<
    InstanceProps & { ref: any } & {
      rotation: number[]
      position: number[]
      color: ColorRepresentation
    }
  > &
    ReactNode &
    any
}) {
  let ref = useRef<any>(null)

  useFrame((_, dt) => {
    ref.current.position.y =
      Math.sin(_.clock.elapsedTime * 1.5 + (i / n) * Math.PI * -2 * 0.5) * 0.3

    ref.current.position.y =
      Math.sin(_.clock.elapsedTime * 1.5 + (i / n) * Math.PI * -2 * 0.5) * 0.3

    ref.current.position.x = i * -(0.1 + 0.1 * Math.sin(_.clock.elapsedTime * 1.5) * 2)

    ref.current.rotation.z = Math.PI * 0.025 * i * Math.sin(_.clock.elapsedTime * 0.5) * 1.5
  })
  return (
    <Compo
      ref={ref}
      rotation={[0.1 + i * 0.035, 0, Math.PI * 0.05 * i]}
      position={[i * -0.05, -0.3, i * 0.075 * 0.0]}
      color={new Color('#ff0000').offsetHSL(i / n, 0.0, 0.15)}
    />
  )
}
