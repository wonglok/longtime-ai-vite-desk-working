import { useGLTF } from '@react-three/drei'
import Room from './room/room.glb?url'
import { useMemo } from 'react'
import {
  BoxGeometry,
  Color,
  DoubleSide,
  MeshPhysicalNodeMaterial,
  SphereGeometry
} from 'three/webgpu'
import {
  add,
  color,
  cos,
  float,
  hue,
  normalFlat,
  normalLocal,
  positionLocal,
  sin,
  time,
  uv,
  vec3
} from 'three/tsl'
// import { EdgeSplitModifier } from 'three/examples/jsm/Addons.js'

// let modifier = new EdgeSplitModifier()
export function RoomFX(props) {
  const geo = useMemo(() => {
    return new SphereGeometry(1, 256, 256)
    // return new BoxGeometry(1, 1, 1, 100, 100, 100)
  }, [])

  const mat = useMemo(() => {
    let offset = vec3(
      //
      sin(positionLocal.z.mul(5).add(time)).mul(0.1),
      sin(positionLocal.x.mul(10).add(time)).mul(0.25),
      sin(positionLocal.y.mul(5).add(time)).mul(0.25)
    )

    return new MeshPhysicalNodeMaterial({
      //
      colorNode: hue(
        color('#6dddc8'),
        vec3(
          cos(time.add(positionLocal.x.mul(5))),
          cos(time.add(positionLocal.y.mul(5))),
          cos(time.add(positionLocal.z.mul(5)))
        )
      ).normalize(),
      emissiveNode: color('#40525a'),
      positionNode: positionLocal.add(normalLocal.mul(0.015).add(offset)),

      //
      roughnessNode: float(0.5),
      metalnessNode: float(1.0),
      //
      side: DoubleSide
      //
    })
  }, [])

  return (
    <group {...props} dispose={null} position={[0, 1, 0.5]}>
      <mesh geometry={geo} key={mat.uuid} material={mat} scale={[4, 2, 4]} />
    </group>
  )
}
