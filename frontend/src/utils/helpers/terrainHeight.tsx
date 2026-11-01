import * as THREE from "three"

/**
 * Creates a function to get terrain height at given x,z coordinates using raycasting
 * @param terrain - The terrain GLTF object with scene.children[0] containing the mesh
 * @returns Function that takes (x, z) coordinates and returns height (y) value
 */
export const createTerrainHeightSampler = (terrain?: any) => {
  if (!terrain?.scene?.children?.[0]?.geometry) {
    return (x: number, z: number) => 0 // fallback to ground level
  }

  const geometry = terrain.scene.children[0].geometry
  const raycaster = new THREE.Raycaster()
  const tempMesh = new THREE.Mesh(geometry)

  // Apply terrain transformations
  if (terrain.scene.children[0].position) {
    tempMesh.position.copy(terrain.scene.children[0].position)
  }
  if (terrain.scene.children[0].rotation) {
    tempMesh.rotation.copy(terrain.scene.children[0].rotation)
  }
  if (terrain.scene.children[0].scale) {
    tempMesh.scale.copy(terrain.scene.children[0].scale)
  }

  return (x: number, z: number): number => {
    raycaster.set(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0))
    const intersects = raycaster.intersectObject(tempMesh)
    return intersects.length > 0 ? intersects[0].point.y : 0
  }
}
