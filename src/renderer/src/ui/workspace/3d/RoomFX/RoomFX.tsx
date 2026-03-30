import { useGLTF } from '@react-three/drei'
import Room from './room/room.glb?url'
import { useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  DoubleSide,
  MeshPhysicalNodeMaterial,
  SphereGeometry
} from 'three/webgpu'
import {
  add,
  backgroundBlurriness,
  cameraPosition,
  color,
  cos,
  directionToColor,
  directPointLight,
  dot,
  faceDirection,
  float,
  hue,
  normalFlat,
  normalLocal,
  positionLocal,
  positionWorld,
  sin,
  time,
  uv,
  vec3
} from 'three/tsl'
import { useFrame } from '@react-three/fiber'
// import { EdgeSplitModifier } from 'three/examples/jsm/Addons.js'

// let modifier = new EdgeSplitModifier()
export function RoomFX(props) {
  const ref = useRef<any>(null)
  const geo = useMemo(() => {
    let sph = new SphereGeometry(1, 512, 256, 0, Math.PI * 1, 0, Math.PI).rotateY(Math.PI * 1)
    sph.computeVertexNormals()

    return sph
    // return new BoxGeometry(1, 1, 1, 100, 100, 100)
  }, [])

  const mat = useMemo(() => {
    let offset = vec3(
      //
      sin(positionLocal.xy.length().mul(65).add(time.mul(1.0))),
      sin(positionLocal.yz.length().mul(65).add(time.mul(1.0))),
      sin(positionLocal.zx.length().mul(65).add(time.mul(1.0)))
    ).mul(0.0333)

    return new MeshPhysicalNodeMaterial({
      //
      colorNode: vec3(1, 1, 1),
      emissiveNode: vec3(0.15, 0.15, 0.15),

      //
      positionNode: positionLocal.add(offset),
      normalNode: normalLocal.negate().normalize(),
      //
      roughnessNode: float(1.0),
      metalnessNode: float(1.0),
      //
      side: DoubleSide
      //
    })
  }, [geo])

  useFrame((_) => {
    ref.current.lookAt(_.camera.position)
  })

  return (
    <group {...props} dispose={null} position={[0, 0, 0]}>
      <mesh ref={ref} geometry={geo} key={mat.uuid} material={mat} scale={[10, 10, 10]} />
    </group>
  )
}
