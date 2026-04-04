import { OrbitControls } from '@react-three/drei'
import { DeskMesh } from '../PageSelectFolder/DeskMesh'
import { DiamondCompos } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondComponent'
import { Spinner } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondCanvas'
import { useHome } from '../useHome'

export function PageViewFiles({ workspace }: { workspace: string }) {
  console.log('workspace', workspace)

  return (
    <>
      <OrbitControls
        makeDefault
        object-position={[0, 2, 3.5]}
        target={[0, 1, 0]}
        minDistance={1.5}
        maxDistance={7}
        minAzimuthAngle={-0.25 * Math.PI}
        maxAzimuthAngle={0.25 * Math.PI}
        maxPolarAngle={0.5 * Math.PI}
        minPolarAngle={0.25 * Math.PI}
      ></OrbitControls>

      <DeskMesh></DeskMesh>

      <group
        //
        position={[0, 1, 0]}
        //
        onClick={() => {
          useHome.setState({
            pageAt: 'home'
          })
        }}
      >
        <Spinner>
          <DiamondCompos></DiamondCompos>
        </Spinner>
      </group>
      {/*  */}

      {/*  */}
    </>
  )
}
