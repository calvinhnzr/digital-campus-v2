import React, { useMemo } from "react"
import { Outlines } from "@react-three/drei"
import * as THREE from "three"

/**
 * Renders all meshes in a GLTF model with outlines.
 * @param {object} props
 * @param {any} props.model - The loaded GLTF model object (from useGLTF).
 * @param {string} [props.color="#000000"] - Outline color.
 * @param {number} [props.thickness=0.03] - Outline thickness.
 */
const ModelWithOutlines = ({ model, color = "#000000", thickness = 10 }) => {
  // Memoize mesh extraction for performance
  const meshes = useMemo(() => {
    const found: any[] = []
    model.scene.traverse((child: any) => {
      if (child.isMesh) found.push(child)
    })
    return found
  }, [model])

  return (
    <group>
      {meshes.map((mesh, i) => (
        <mesh
          key={mesh.uuid}
          geometry={mesh.geometry}
          material={mesh.material}
          position={mesh.position}
          rotation={mesh.rotation}
          scale={mesh.scale}
          castShadow={mesh.castShadow}
          receiveShadow={mesh.receiveShadow}
        >
          <Outlines thickness={thickness} color={color} />
        </mesh>
      ))}
    </group>
  )
}

export default ModelWithOutlines
