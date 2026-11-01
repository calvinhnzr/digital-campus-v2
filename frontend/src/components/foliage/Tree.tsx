import * as THREE from "three"
import { Bush } from "@/components/foliage/Bush"
import { useControls } from "leva"

// The Tree component itself (for reference/preview, not for instancing)
type TreeProps = {
  logColor?: string
  leafColor?: string
  modelTree: any
  refBush: any
}

// Export helpers to extract geometry/material for instancing
function getTreeLogGeometry(modelTree: any): THREE.BufferGeometry | null {
  const mesh = modelTree?.scene?.children?.[0] as THREE.Mesh
  return mesh?.geometry ?? null
}

export const TreeMaterial = ({ color, leafColor }: { color?: string; leafColor?: string }) => {
  return (
    <meshStandardMaterial
      color={color || "#8d7661"}
      attach="material"
      transparent={true}
      alphaTest={0.55}
      // depthTest={false}
      // depthWrite={false}
    />
  )
}

export const TreeGeometry = ({ modelTree }: { modelTree: any }) => {
  return <primitive object={getTreeLogGeometry(modelTree)} attach="geometry" />
}

const Tree = ({ logColor = "#8d7661", leafColor = "#8acd7f", modelTree, refBush }: TreeProps) => {
  // Leva controls for color and scale
  const controls = useControls("Tree", {
    logColor: { value: logColor, label: "Log" },
    leafColor: { value: leafColor, label: "Leafs" },
    posZ: { value: -1, min: -10, max: 10, step: 0.1, label: "Position Z" },
  })

  return (
    <>
      <group position={[0, controls.posZ, 0]} rotation={[0, 0, 0]} scale={1}>
        <mesh
          position={modelTree.scene.children[0].position}
          rotation={modelTree.scene.children[0].rotation}
          scale={modelTree.scene.children[0].scale}
          material={undefined}
          // castShadow
          // receiveShadow
        >
          <TreeGeometry modelTree={modelTree} />
          <TreeMaterial color={controls.logColor} />
        </mesh>

        {refBush.scene.children.map((child, index) => {
          const position = new THREE.Vector3()
          child.getWorldPosition(position)
          return (
            <group position={position} key={index} scale={1.1}>
              <Bush color={controls.leafColor} />
            </group>
          )
        })}
      </group>
    </>
  )
}

export default Tree
