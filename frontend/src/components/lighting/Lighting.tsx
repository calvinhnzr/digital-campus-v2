import React, { useRef } from "react"
import { useHelper, PivotControls } from "@react-three/drei"
import { useControls, folder } from "leva"
import * as THREE from "three"

const Lighting = () => {
  const {
    lightPosition,
    lightIntensity,
    ambientIntensity,
    lightColor,
    lightTargetPosition,
    mapSize,
    radius,
    bias,
    normalBias,
    near,
    far,
    camera,
    darkness,
    focus,
  } = useControls(
    "🌞 Lighting",
    {
      lightPosition: { value: [-4, 30, 37], min: -1000, max: 1000, step: 1 },
      lightTargetPosition: { value: [35, 9, 20], min: -1000, max: 1000, step: 1 },
      lightIntensity: { value: 3.4, min: 0, max: 10, step: 0.01, label: "Directional Intensity" },
      ambientIntensity: { value: 0, min: -1, max: 2, step: 0.001, label: "Ambient Intensity" },
      lightColor: { value: "#ffd6bf", label: "Light Color" },
      Shadow: folder({
        mapSize: { value: 256 * 1, min: 256, max: 4096 * 2, step: 1, label: "Map Size" },
        radius: { value: 3.14, min: 0, max: 10, step: 0.01, label: "Radius" },
        bias: { value: -0.0005, min: -0.005, max: 0.005, step: 0.0001, label: "Bias" },
        normalBias: { value: 0, min: -1, max: 1, step: 0.0001, label: "Normal Bias" },
        near: { value: 0.96, min: 0.01, max: 10, step: 0.01, label: " Near" },
        far: { value: 96, min: 10, max: 2000, step: 1, label: " Far" },
        camera: { value: 25, min: -200, max: 200, step: 1, label: "Camera" },
        darkness: { value: 1, min: 0, max: 2, step: 0.01, label: "Darkness" },
        focus: { value: 1, min: 0, max: 2, step: 0.01, label: "Focus" },
      }),
    },
    { collapsed: true }
  )

  const lightRef = useRef<THREE.DirectionalLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)
  // @ts-ignore
  useHelper(lightRef, THREE.DirectionalLightHelper)

  // Keep light target updated
  React.useEffect(() => {
    if (lightRef.current && targetRef.current) {
      // @ts-ignore
      lightRef.current.target = targetRef.current
    }
  }, [lightRef, targetRef])

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <mesh position={lightPosition} visible>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.5} />
      </mesh>
      <directionalLight
        ref={lightRef}
        position={lightPosition}
        intensity={lightIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-radius={radius}
        shadow-bias={bias}
        shadow-normalBias={normalBias}
        shadow-camera-near={near}
        shadow-camera-far={far}
        shadow-camera-top={camera}
        shadow-camera-bottom={-camera}
        shadow-camera-left={-camera}
        shadow-camera-right={camera}
        shadow-darkness={darkness}
        shadow-focus={focus}
      />
      <mesh position={lightTargetPosition} visible>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.5} />
      </mesh>
      <object3D ref={targetRef} position={lightTargetPosition} />
    </>
  )
}

export default Lighting
