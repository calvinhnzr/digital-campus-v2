// @ts-nocheck
import React, { useEffect, useRef, useMemo } from "react"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"
import { Outlines } from "@react-three/drei"

interface CustomMeshProps {
  model: GLTF | { scene: THREE.Object3D }
  color?: string
  receiveShadow?: boolean
  castShadow?: boolean
  position?: [number, number, number]
  visible?: boolean
  opacity?: number
  scale?: [number, number, number]
}

const CustomMesh: React.FC<CustomMeshProps> = React.memo(
  ({ model, color, receiveShadow = false, castShadow = false, position, visible = true, opacity = 1, scale }) => {
    const groupRef = useRef<THREE.Group>(null)

    // Clone the model and apply settings immediately
    const clonedScene = useMemo(() => {
      const cloned = model.scene.clone()

      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.receiveShadow = receiveShadow
          child.castShadow = castShadow

          // Set render order for transparent objects to prevent flickering
          child.renderOrder = 999
          if (opacity < 1) {
            child.renderOrder = 999
          }

          if (color) {
            // Dispose old material to prevent memory leaks
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose())
              } else {
                child.material.dispose()
              }
            }

            child.material = new THREE.MeshStandardMaterial({
              color: color,
              side: THREE.DoubleSide,
              transparent: opacity < 1,
              opacity: opacity,
              depthWrite: opacity >= 1, // Disable depth write for transparent materials
              polygonOffset: opacity < 1, // Enable polygon offset for transparent materials
              polygonOffsetFactor: opacity < 1 ? 1 : 0,
              polygonOffsetUnits: opacity < 1 ? 1 : 0,
            })
          } else if (opacity < 1) {
            // Apply opacity to existing material when no color override
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  mat.transparent = true
                  mat.opacity = opacity
                  mat.depthWrite = false // Disable depth write for transparent materials
                  mat.polygonOffset = true
                  mat.polygonOffsetFactor = 1
                  mat.polygonOffsetUnits = 1
                })
              } else {
                child.material.transparent = true
                child.material.opacity = opacity
                child.material.depthWrite = false // Disable depth write for transparent materials
                child.material.polygonOffset = true
                child.material.polygonOffsetFactor = 1
                child.material.polygonOffsetUnits = 1
              }
            }
          }
        }
      })

      return cloned
    }, [model.scene, color, receiveShadow, castShadow, opacity])

    // Update properties when they change
    useEffect(() => {
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.receiveShadow = receiveShadow
            child.castShadow = castShadow

            // Set render order for transparent objects
            if (opacity < 1) {
              child.renderOrder = 999
            } else {
              child.renderOrder = 0
            }

            if (color && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.color.set(color)
              child.material.transparent = opacity < 1
              child.material.opacity = opacity
              child.material.depthWrite = opacity >= 1 // Disable depth write for transparent materials
              child.material.polygonOffset = opacity < 1
              child.material.polygonOffsetFactor = opacity < 1 ? 1 : 0
              child.material.polygonOffsetUnits = opacity < 1 ? 1 : 0
              child.material.needsUpdate = true
            } else if (!color && child.material) {
              // Update opacity on existing material when no color override
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  mat.transparent = opacity < 1
                  mat.opacity = opacity
                  mat.depthWrite = opacity >= 1 // Disable depth write for transparent materials
                  mat.polygonOffset = opacity < 1
                  mat.polygonOffsetFactor = opacity < 1 ? 1 : 0
                  mat.polygonOffsetUnits = opacity < 1 ? 1 : 0
                  mat.needsUpdate = true
                })
              } else {
                child.material.transparent = opacity < 1
                child.material.opacity = opacity
                child.material.depthWrite = opacity >= 1 // Disable depth write for transparent materials
                child.material.polygonOffset = opacity < 1
                child.material.polygonOffsetFactor = opacity < 1 ? 1 : 0
                child.material.polygonOffsetUnits = opacity < 1 ? 1 : 0
                child.material.needsUpdate = true
              }
            }
          }
        })
      }
    }, [receiveShadow, castShadow, color, opacity])

    return (
      <primitive
        ref={groupRef}
        object={clonedScene}
        position={position || model.scene.position}
        visible={visible}
        scale={scale}
      />
    )
  }
)

export default CustomMesh
