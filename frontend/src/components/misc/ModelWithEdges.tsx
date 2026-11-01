import React, { useMemo } from "react"
import * as THREE from "three"

const ModelWithEdges = ({ model, color = "#ffffff" }) => {
  const edges = useMemo(() => {
    const edgeObjects = new THREE.Group()

    // Ensure all world matrices are up-to-date before extracting edges
    model.scene.updateWorldMatrix(true, true)

    model.scene.traverse((child) => {
      if (child.isMesh) {
        // Update the child's world matrix
        child.updateWorldMatrix(true, false)
        const edges = new THREE.EdgesGeometry(child.geometry)
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: new THREE.Color(color) }))
        // Copy the mesh's world transformation
        line.applyMatrix4(child.matrixWorld)
        edgeObjects.add(line)
      }
    })

    return edgeObjects
  }, [model, color])

  return <primitive object={edges} />
}

export default ModelWithEdges
