import { RoundedBoxGeometry } from '@react-three/drei'

export function FileItem() {
  return (
    <>
      <mesh>
        {/*  */}
        {/*  */}
        <RoundedBoxGeometry
          args={[1, 1, 1]}
          scale={[1, 1, 0.15]}
          radius={1.5 / 10}
        ></RoundedBoxGeometry>

        <meshPhysicalNodeMaterial
          roughness={0.1}
          metalness={0}
          transmission={1}
          thickness={2}
          color={'#ffffff'}
        ></meshPhysicalNodeMaterial>
        {/*  */}
        {/*  */}
      </mesh>

      <directionalLight position={[0, 2, 10]}></directionalLight>
    </>
  )
}
