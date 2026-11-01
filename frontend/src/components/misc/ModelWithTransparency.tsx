import React, { useMemo } from "react"
import { MeshTransmissionMaterial, useGLTF, AccumulativeShadows, RandomizedLight, Environment } from "@react-three/drei"
import * as THREE from "three"

/**
 * Renders a model with all meshes set to a given transparency.
 * @param {object} props
 * @param {any} props.model - The loaded GLTF model object (from useGLTF).
 * @param {number} [props.opacity=0.5] - Opacity value between 0 (fully transparent) and 1 (opaque).
 */
const ModelWithTransparency = ({ model, opacity = 0.5 }) => {
  const transparentScene = useMemo(() => {
    const clone = model.scene.clone(true)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.transparent = true
        child.material.opacity = opacity
      }
    })
    return clone
  }, [model, opacity])

  return <primitive object={transparentScene} />
}

export default ModelWithTransparency
