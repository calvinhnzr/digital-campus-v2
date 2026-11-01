import React, { useRef } from "react"
import * as THREE from "three"

const lightSettings = {
  position: [-4, 30, 37] as [number, number, number],
  intensity: 3.4,
  color: "#ffd6bf",
  castShadow: true,
  "shadow-mapSize-width": 1024 * 8,
  "shadow-mapSize-height": 1024 * 8,
  "shadow-radius": 3.14,
  "shadow-bias": -0.0005,
  "shadow-normalBias": 0,
  "shadow-camera-near": 0.96,
  "shadow-camera-far": 96,
  "shadow-camera-top": 25,
  "shadow-camera-bottom": -25,
  "shadow-camera-left": -25,
  "shadow-camera-right": 25,
  "shadow-darkness": 1,
  "shadow-focus": 1,
}

const ambientIntensity = -0.4
const lightTargetPosition = [35, 9, 20] as [number, number, number]

const FinalLighting: React.FC = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  React.useEffect(() => {
    if (lightRef.current && targetRef.current) {
      // @ts-ignore
      lightRef.current.target = targetRef.current
    }
  }, [])

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight ref={lightRef} {...lightSettings} />
      <object3D ref={targetRef} position={lightTargetPosition} />
    </>
  )
}

export default FinalLighting
