import { OrbitControls } from '@react-three/drei'
import { DeskMesh } from '../PageSelectFolder/DeskMesh'
import { DiamondCompos } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondComponent'
import { Spinner } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondCanvas'

export function PageViewFiles({ workspace }: { workspace: string }) {
  return (
    <>
      <OrbitControls
        makeDefault
        object-position={[0, 2, 3.5]}
        target={[0, 1, 0]}
        minDistance={3}
        maxDistance={7}
        minAzimuthAngle={-0.25 * Math.PI}
        maxAzimuthAngle={0.25 * Math.PI}
        maxPolarAngle={0.5 * Math.PI}
        minPolarAngle={0.25 * Math.PI}
      ></OrbitControls>

      <DeskMesh></DeskMesh>

      <group position={[0, 1, 0]}>
        <Spinner>
          <DiamondCompos></DiamondCompos>
        </Spinner>
      </group>
      {/*  */}
      {/*  */}
    </>
  )
}
