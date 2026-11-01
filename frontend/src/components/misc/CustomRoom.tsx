// @ts-nocheck
import React, { useMemo } from "react"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"
import { Outlines } from "@react-three/drei"
import { useClickHandler } from "@/hooks/useClickHandler"

interface CustomRoomProps {
  model: GLTF
  searchQuery?: string
  floorNumber?: number
  isSearchMode?: boolean
  onRoomClick?: (roomName: string) => void
  opacityOverride?: number
  pickingOnly?: boolean
  currentFloor?: number
  COLORS?: string[]
}

const CustomRoom: React.FC<CustomRoomProps> = ({
  model,
  searchQuery = "",
  floorNumber = 0,
  isSearchMode = false,
  onRoomClick,
  opacityOverride,
  pickingOnly = false,
  currentFloor = 0,
  COLORS = ["#051230", "#051230", "#051230", "#051230"],
}) => {
  const OPACITY = opacityOverride ?? 1
  const PADDING = 0.6
  const { makeRoomOnClick } = useClickHandler()

  // Process room meshes - create extruded geometry from flat shapes
  const roomMeshes = useMemo(() => {
    if (!model?.scene) return []

    return model.scene.children
      .filter((child: any) => child.isMesh)
      .map((mesh: any) => {
        const roomName = String(mesh.name || "")

        // Determine room color based on search matching
        let roomColor = COLORS[floorNumber]

        if (isSearchMode && searchQuery.length >= 2) {
          if (roomName === searchQuery) {
            roomColor = "coral" // Exact match
          } else if (roomName.startsWith(searchQuery)) {
            roomColor = COLORS[floorNumber] // Partial match
          } else {
            roomColor = "#606060" // No match - grey out
          }
        }

        // Extract vertices from the mesh geometry to create a shape
        const positionAttr = mesh.geometry.attributes.position
        const shape = new THREE.Shape()

        if (positionAttr && positionAttr.count > 0) {
          // Start the shape from the first vertex
          shape.moveTo(positionAttr.getX(0), positionAttr.getZ(0))

          // Add all other vertices
          for (let i = 1; i < positionAttr.count; i++) {
            shape.lineTo(positionAttr.getX(i), positionAttr.getZ(i))
          }
        }

        // Create extruded geometry with depth of 3.3 units
        const extrudeSettings = {
          depth: 3.3,
          bevelEnabled: false,
        }
        const extrudedGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

        return {
          geometry: extrudedGeometry,
          roomName,
          roomColor,
          position: mesh.position,
          rotation: mesh.rotation,
          scale: mesh.scale,
        }
      })
  }, [model, searchQuery, floorNumber, isSearchMode, COLORS])

  return (
    <group>
      {roomMeshes.map(({ geometry, roomName, roomColor, position, rotation, scale }) => (
        <mesh
          key={roomName}
          geometry={geometry}
          position={position}
          rotation={rotation}
          scale={scale}
          onClick={makeRoomOnClick({ roomKey: roomName, floorNumber, isVisible: true })}
        >
          <meshBasicMaterial
            color={roomColor}
            colorWrite={!pickingOnly}
            depthWrite={!pickingOnly}
            depthTest={!pickingOnly}
            transparent={true}
            opacity={OPACITY}
            side={THREE.DoubleSide}
          />
          {!pickingOnly && <Outlines thickness={3} color="#506da2" transparent />}
        </mesh>
      ))}
    </group>
  )
}

export default CustomRoom
