import { Center, Merged, Text3D, useGLTF } from '@react-three/drei'
// import { extend, InstanceProps, useFrame, useGraph } from '@react-three/fiber'
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
// import { Color, ColorRepresentation, DoubleSide, Mesh, Object3D } from 'three'
// import { MeshPhysicalNodeMaterial } from 'three/webgpu'
// import folder from '../assets/smart-folder.glb?url'
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js'
import { helvetica } from './helvetica'
import { CenterMe } from './CenterMe'

import gsap from 'gsap'
import { Color } from 'three'

export const NextButton = () => {
  const baseMat = useRef<any>(null)
  const textMat = useRef<any>(null)
  const roundedGeo = useMemo(() => new RoundedBoxGeometry(3, 1, 1, 7, 1 / 4), [])

  const bgNormalColor = useMemo(() => new Color('#ffffff'), [])
  const bgHoverColor = useMemo(() => new Color('#7fd956'), [])

  const textNormalColor = useMemo(() => new Color('#000000'), [])
  const textHoverColor = useMemo(() => new Color('#034616'), [])

  return (
    <>
      <group
        onPointerEnter={() => {
          let progress = { value: 0 }
          let bgCol = new Color().set(baseMat.current.color)
          let texCol = new Color().set(textMat.current.color)

          gsap
            .to(progress, {
              value: 1,
              duration: 0.5,
              ease: 'expo.inOut',
              onUpdate: () => {
                bgCol.lerpHSL(bgHoverColor, progress.value)
                texCol.lerpHSL(textHoverColor, progress.value)
                baseMat.current.color.copy(bgCol)
                textMat.current.color.copy(texCol)
              }
            })
            .play()
        }}
        onPointerLeave={() => {
          let progress = { value: 0 }
          let bgCol = new Color().set(baseMat.current.color)
          let texCol = new Color().set(textMat.current.color)

          gsap
            .to(progress, {
              value: 1,
              duration: 0.5,
              ease: 'expo.inOut',
              onUpdate: () => {
                bgCol.lerpHSL(bgNormalColor, progress.value)
                texCol.lerpHSL(textNormalColor, progress.value)
                baseMat.current.color.copy(bgCol)
                textMat.current.color.copy(texCol)
              }
            })
            .play()
        }}
        rotation={[-0.25 * Math.PI, 0, 0]}
      >
        <group scale={0.5}>
          <group position={[0, 0, -0.05]}>
            <CenterMe>
              <mesh geometry={roundedGeo} scale={[1, 1, 0.1]}>
                <meshStandardMaterial
                  color={bgNormalColor}
                  roughness={0.3}
                  metalness={1}
                  ref={baseMat}
                ></meshStandardMaterial>
              </mesh>
            </CenterMe>
          </group>

          <CenterMe>
            <Text3D size={0.5} height={0.05} font={helvetica as any}>
              {`Next`}

              <meshStandardMaterial
                color={textNormalColor}
                metalness={0}
                roughness={1}
                ref={textMat}
              ></meshStandardMaterial>
            </Text3D>
          </CenterMe>
        </group>
      </group>
    </>
  )
}

export const SelectButton = () => {
  const baseMat = useRef<any>(null)
  const textMat = useRef<any>(null)
  const roundedGeo = useMemo(() => new RoundedBoxGeometry(6.5, 1, 1, 7, 1 / 4), [])

  const bgNormalColor = useMemo(() => new Color('#ffffff'), [])
  const bgHoverColor = useMemo(() => new Color('#5688d9'), [])

  const textNormalColor = useMemo(() => new Color('#000000'), [])
  const textHoverColor = useMemo(() => new Color('#040346'), [])

  return (
    <>
      <group
        onPointerEnter={() => {
          let progress = { value: 0 }
          let bgCol = new Color().set(baseMat.current.color)
          let texCol = new Color().set(textMat.current.color)

          gsap
            .to(progress, {
              value: 1,
              duration: 0.5,
              ease: 'expo.inOut',
              onUpdate: () => {
                bgCol.lerpHSL(bgHoverColor, progress.value)
                texCol.lerpHSL(textHoverColor, progress.value)
                baseMat.current.color.copy(bgCol)
                textMat.current.color.copy(texCol)
              }
            })
            .play()
        }}
        onPointerLeave={() => {
          let progress = { value: 0 }
          let bgCol = new Color().set(baseMat.current.color)
          let texCol = new Color().set(textMat.current.color)

          gsap
            .to(progress, {
              value: 1,
              duration: 0.5,
              ease: 'expo.inOut',
              onUpdate: () => {
                bgCol.lerpHSL(bgNormalColor, progress.value)
                texCol.lerpHSL(textNormalColor, progress.value)
                baseMat.current.color.copy(bgCol)
                textMat.current.color.copy(texCol)
              }
            })
            .play()
        }}
        rotation={[-0.25 * Math.PI, 0, 0]}
      >
        <group scale={0.5}>
          <group position={[0, 0, -0.05]}>
            <CenterMe>
              <mesh geometry={roundedGeo} scale={[1, 1, 0.1]}>
                <meshStandardMaterial
                  color={bgNormalColor}
                  roughness={0.3}
                  metalness={1}
                  ref={baseMat}
                ></meshStandardMaterial>
              </mesh>
            </CenterMe>
          </group>

          <CenterMe>
            <Text3D size={0.5} height={0.05} font={helvetica as any}>
              {`Select AI Folder`}

              <meshStandardMaterial
                color={textNormalColor}
                metalness={0}
                roughness={1}
                ref={textMat}
              ></meshStandardMaterial>
            </Text3D>
          </CenterMe>
        </group>
      </group>
    </>
  )
}
