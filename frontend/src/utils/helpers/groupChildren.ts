/**
 * Groups the top-level children of a GLTF scene by their name.
 * Each child is wrapped as `{ scene: group }` to mimic the shape of a `useGLTF` result,
 * allowing consumers to use the same `.scene.children` / `.scene.traverse()` API
 * as they would with individually loaded GLTF files.
 *
 * @param gltf - The GLTF result object returned by `useGLTF`.
 * @returns A record mapping each top-level group name to `{ scene: group }`.
 */
export const groupChildren = (gltf: any): Record<string, { scene: any }> => {
  if (!gltf?.scene?.children) return {}
  const parentMap: Record<string, { scene: any }> = {}
  gltf.scene.children.forEach((group: any) => {
    parentMap[group.name] = { scene: group }
  })
  return parentMap
}
