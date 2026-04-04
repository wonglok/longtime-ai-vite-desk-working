import { useMemo } from 'react'
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js'
import { DoubleSide, Mesh, MeshPhysicalNodeMaterial } from 'three/webgpu'

export function DeskMesh() {
  let box = useMemo(() => {
    let geo = new RoundedBoxGeometry(14, 0.1, 10, 7, 0.5)

    geo.translate(0, 0, 0)
    geo.scale(1, 1, 1)

    let mat = new MeshPhysicalNodeMaterial({
      //
      roughness: 0.5,
      metalness: 0.3,
      color: '#f7e5c9',
      vertexColors: true,
      side: DoubleSide,
      transmission: 0.7
    })

    let box = new Mesh(geo, mat)

    return box
  }, [])

  return (
    <>
      <primitive object={box}></primitive>
    </>
  )
}
