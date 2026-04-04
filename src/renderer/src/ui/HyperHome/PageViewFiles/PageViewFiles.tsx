import { OrbitControls } from '@react-three/drei'
import { DeskMesh } from '../PageSelectFolder/DeskMesh'
import { DiamondCompos } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondComponent'
import { Spinner } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondCanvas'
import { useHome } from '../useHome'
import { GeneralButton } from '../PageSelectFolder/GeneralButton'

export function PageViewFiles({ workspace }: { workspace: string }) {
  console.log('workspace', workspace)

  return (
    <>
      <OrbitControls
        makeDefault
        object-position={[0, 10, 12]}
        target={[0, 1, 0]}
        minDistance={1.5}
        maxDistance={17}
        minAzimuthAngle={-0.25 * Math.PI}
        maxAzimuthAngle={0.25 * Math.PI}
        maxPolarAngle={0.5 * Math.PI}
        minPolarAngle={0.25 * Math.PI}
      ></OrbitControls>

      <DeskMesh></DeskMesh>

      <group position={[-17 / 2, 0, 0]}>
        <group
          //
          position={[0, 1.5, 0]}
          //
          scale={1.5}
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

        <group rotation={[-0.23 * Math.PI, 0, 0]} position={[0, 0.5, 1]}>
          <GeneralButton
            title={'Home'}
            bgNormal={'#fff'}
            bgHover={'#7fd956'}
            textNormal={'#000000'}
            textHover={'#034616'}
            width={3.5}
          ></GeneralButton>
        </group>
      </group>

      {/*  */}

      {/*  */}
    </>
  )
}
