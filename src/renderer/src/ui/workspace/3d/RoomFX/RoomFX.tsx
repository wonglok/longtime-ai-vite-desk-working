import { useGLTF } from '@react-three/drei'
import Room from './room/room.glb?url'
import { useMemo } from 'react'
import { BoxGeometry, Color, DoubleSide, MeshPhysicalNodeMaterial } from 'three/webgpu'
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
import { EdgeSplitModifier } from 'three/examples/jsm/Addons.js'

let modifier = new EdgeSplitModifier()
export function RoomFX(props) {
  const geo = useMemo(() => {
    return new BoxGeometry(1, 1, 1, 100, 100, 100)
  }, [])
  const geo2 = useMemo(() => {
    return modifier.modify(geo, 0, true)
  }, [geo])

  const mat = useMemo(() => {
    let offset = vec3(
      //
      0,
      0,
      float(0.0).add(
        //
        sin(
          //
          positionLocal.x.mul(20).add(time)
        ).mul(0.15)
      )
    )

    return new MeshPhysicalNodeMaterial({
      //
      colorNode: hue(color('#42c8df'), cos(time.add(positionLocal.x.mul(5)))),
      emissiveNode: color('#40525a'),
      positionNode: positionLocal.add(normalLocal.mul(0.015).add(offset)),
      roughnessNode: float(0.5),
      metalnessNode: float(1.0),
      //
      side: DoubleSide
      //
    })
  }, [])

  return (
    <group {...props} dispose={null} position={[0, 1, 0.5]}>
      <mesh geometry={geo2} key={mat.uuid} material={mat} scale={[4, 2, 4]} />
    </group>
  )
}
