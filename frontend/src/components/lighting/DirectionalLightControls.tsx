// @ts-nocheck
import React, { useRef, useEffect } from "react"
import { useHelper } from "@react-three/drei"
import { useControls, folder } from "leva"
import * as THREE from "three"

import { defaultSettings } from "@/store/base"

const DirectionalLightControls = () => {
  const {
    lightPosition,
    lightIntensity,
    ambientIntensity,
    lightColor,
    lightTargetPosition,
    mapSize,
    radius,
    blurSamples,
    bias,
    normalBias,
    near,
    far,
    cameraLeft,
    cameraRight,
    cameraTop,
    cameraBottom,
    camera,
    darkness,
    focus,
  } = useControls(
    "💡 Lighting",
    {
      lightPosition: { value: [-4, 30, 37], min: -1000, max: 1000, step: 1 },
      lightTargetPosition: { value: [16, 9, 22], min: -1000, max: 1000, step: 1 },
      lightIntensity: {
        value: defaultSettings.lightIntensity,
        min: 0,
        max: 10,
        step: 0.01,
        label: "Directional Intensity",
      },
      ambientIntensity: {
        value: defaultSettings.ambientIntensity,
        min: -1,
        max: 2,
        step: 0.001,
        label: "Ambient Intensity",
      },
      lightColor: { value: defaultSettings.lightColor, label: "Light Color" },
      Shadow: folder({
        mapSize: { value: 1024 * 8, min: 256, max: 4096 * 2, step: 1, label: "Map Size" },
        radius: { value: 3.14, min: 0, max: 10, step: 0.01, label: "Radius" },
        blurSamples: { value: 2, min: 1, max: 32, step: 1, label: "Blur Samples" },
        bias: { value: -0.0003, min: -0.001, max: 0.001, step: 0.0001, label: "Bias" },
        normalBias: { value: 0.0008, min: -1, max: 1, step: 0.0001, label: "Normal Bias" },
        near: { value: -14, min: -1000, max: 1000, step: 0.01, label: " Near" },
        far: { value: 177, min: 10, max: 2000, step: 1, label: " Far" },
        cameraTop: { value: 138, min: 0, max: 1000, step: 1, label: "Top Camera" },
        cameraRight: { value: 220, min: 0, max: 1000, step: 1, label: "Right Camera" },
        cameraBottom: { value: -54, min: -1000, max: 0, step: 1, label: "Bottom Camera" },
        cameraLeft: { value: -49, min: -1000, max: 0, step: 1, label: "Left Camera" },
        camera: { value: 25, min: -200, max: 1000, step: 1, label: "Camera" },
        darkness: { value: 1, min: 0, max: 2, step: 0.01, label: "Darkness" },
        focus: { value: 1, min: 0, max: 2, step: 0.01, label: "Focus" },
      }),
    },
    { collapsed: true }
  )

  const lightRef = useRef()
  const targetRef = useRef()
  // useHelper(lightRef, THREE.DirectionalLightHelper)

  // Keep light target updated
  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
    // console.log(lightRef.current)
  }, [lightRef, targetRef])

  // Update shadow/light properties
  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.shadow.radius = radius
      lightRef.current.shadow.bias = bias
      lightRef.current.shadow.blurSamples = blurSamples
      lightRef.current.shadow.normalBias = normalBias
      lightRef.current.shadow.camera.near = near
      lightRef.current.shadow.camera.far = far
      lightRef.current.shadow.camera.fov = camera
      lightRef.current.shadow.camera.top = cameraTop
      lightRef.current.shadow.camera.right = cameraRight
      lightRef.current.shadow.camera.bottom = cameraBottom
      lightRef.current.shadow.camera.left = cameraLeft
      lightRef.current.shadow.darkness = darkness
      lightRef.current.shadow.focus = focus
      lightRef.current.shadow.mapSize.width = mapSize
      lightRef.current.shadow.mapSize.height = mapSize
      lightRef.current.shadow.camera.updateProjectionMatrix?.()
    }
    if (targetRef.current) {
      targetRef.current.position.set(...lightTargetPosition)
    }
  }, [
    radius,
    bias,
    normalBias,
    near,
    far,
    cameraLeft,
    cameraRight,
    cameraTop,
    cameraBottom,
    camera,
    darkness,
    focus,
    mapSize,
    lightTargetPosition,
  ])

  // useEffect(() => {
  //   console.log("bias", bias)
  //   console.log("normalBias", normalBias)
  // }, [bias, normalBias])

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        ref={lightRef}
        position={lightPosition}
        intensity={lightIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
      />
      <object3D ref={targetRef} />
    </>
  )
}

export default DirectionalLightControls
