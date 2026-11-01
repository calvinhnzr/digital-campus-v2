import React, { useMemo, useState, useEffect } from "react"
import { useAtom } from "jotai"
import { Mesh, BufferGeometry, Box3, Vector3, Matrix4 } from "three"
import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import { useGLTF, Outlines } from "@react-three/drei"
import { useControls } from "leva"
import { ThreeEvent } from "@react-three/fiber"

import { generateColorShades } from "@/utils/helpers/generateColorShades"
import { path } from "@/store/base"
import {
  currentFloorAtom,
  searchRoomAtom,
  isSearchModeAtom,
  currentModeAtom,
  showFloorPlanAtom,
  isRoomLockedAtom,
  showAllFloorsInSearchAtom,
  selectedRoomTypesAtom,
  selectedInstitutionAtom,
  showAllPOIsAtom,
  poiDataSidebarOpenAtom,
  selectedPoiIdAtom,
} from "@/store/atom"
import { useClickHandler } from "@/hooks/useClickHandler"
import { useFloorPlanData } from "@/hooks/useFloorPlanData"
import { roomsByType, getRoomNumbersForFilter } from "@/data/rooms"

// Constants
const COLOR_LIFT = "#e74514"
const COLOR_STAIRS = "#d69754"
const COLOR_DOORS = "#327570" // Lemon green
const COLOR_POI = "#2ecc71" // Green for Points of Interest
const COLOR_ROOM_NOT_FOUND = "#7f8495"
const COLOR_OUTLINES = "#3f3f3f"
const COLOR_FLOOR = "#6e6e6e"
const ROOM_POSITION_OFFSET = 0.2 // Adjust this value to move rooms up (higher) or down (lower)
const DEFAULT_ROOM_HEIGHT = 3.3 // Standard single-floor room height
const DOUBLE_HEIGHT_EPSILON = 1.4 // Small extra to ensure visual contact with the slab above
const PADDING = 0.6
const PADDING_FLOOR = 0.2

// Optional per-room height overrides.
// Value is a multiplier of DEFAULT_ROOM_HEIGHT (e.g., 2 doubles height, 0.5 halves it).
// Add room numbers here to increase or decrease their height.
const ROOM_HEIGHT_OVERRIDES: Record<string, number> = {
  // Double-height rooms (reach floor above)
  "0401": 2,
  "0402": 2,
  "0138": 0.7,
  "0137": 0.7,
  "0136": 0.7,
  "0135": 0.7,
  "0130": 0.7,
  "0128": 0.7,

  // Examples:
  // "0205": 0.5, // half-height
  // "0310": 1.5, // one and a half height
}

// CustomFloor component - unchanged from original
interface CustomFloorProps {
  modelScene: any
  isVisible: boolean
  color?: string
  pickingOnly?: boolean
  opacityOverride?: number
}

const CustomFloor: React.FC<CustomFloorProps> = ({
  modelScene,
  isVisible,
  color = "#4c4c4c",
  pickingOnly = false,
  opacityOverride,
}) => {
  const OPACITY = opacityOverride ?? 1

  return (
    <group visible={isVisible}>
      {modelScene?.children
        .filter((child: any) => child.isMesh)
        .map((mesh: any, index: number) => (
          <mesh
            key={index}
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          >
            <meshBasicMaterial
              color={color}
              colorWrite={!pickingOnly}
              depthWrite={!pickingOnly}
              depthTest={!pickingOnly}
              transparent={true}
              opacity={OPACITY}
              side={THREE.DoubleSide}
            />
            {!pickingOnly && (
              <Outlines
                //
                thickness={3}
                color={COLOR_OUTLINES}
                transparent
              />
            )}
          </mesh>
        ))}
    </group>
  )
}

// Helper function to extrude a flat mesh geometry to create 3D volume with room ID attribute
const extrudeMeshGeometry = (
  mesh: Mesh,
  height: number,
  yOffset: number,
  padding: number = 0,
  roomId: number = 0
): { geometry: BufferGeometry; roomName: string; bounds: Box3 } => {
  const originalGeometry = mesh.geometry.clone()

  // Apply mesh transformations to get world space coordinates
  const matrix = new Matrix4()
  matrix.compose(mesh.position, mesh.quaternion, mesh.scale)
  originalGeometry.applyMatrix4(matrix)

  // Calculate the bounding box and center for padding
  const boundingBox = new Box3().setFromBufferAttribute(originalGeometry.attributes.position as THREE.BufferAttribute)
  const center = boundingBox.getCenter(new Vector3())
  const size = boundingBox.getSize(new Vector3())

  // Calculate scale factors based on padding (reduce size on X and Z)
  const scaleX = padding > 0 ? (size.x - padding) / size.x : 1
  const scaleZ = padding > 0 ? (size.z - padding) / size.z : 1

  // Apply scaling from center point (shrink inward)
  if (padding > 0) {
    const positions = originalGeometry.attributes.position
    const posArray = positions.array as Float32Array
    for (let i = 0; i < posArray.length; i += 3) {
      // Get vertex position
      const x = posArray[i]
      const y = posArray[i + 1]
      const z = posArray[i + 2]

      // Scale from center point
      posArray[i] = center.x + (x - center.x) * scaleX
      posArray[i + 2] = center.z + (z - center.z) * scaleZ
    }
    positions.needsUpdate = true
  }

  // Get the positions from the 2D mesh
  const positions = originalGeometry.attributes.position
  const posArray = positions.array as Float32Array
  const vertexCount = positions.count

  // Create new geometry with extruded vertices
  const newPositions: number[] = []
  const newIndices: number[] = []

  // Add bottom vertices (original mesh)
  for (let i = 0; i < posArray.length; i += 3) {
    newPositions.push(posArray[i], posArray[i + 1], posArray[i + 2])
  }

  // Add top vertices (extruded up by height)
  for (let i = 0; i < posArray.length; i += 3) {
    newPositions.push(posArray[i], posArray[i + 1] + height, posArray[i + 2])
  }

  // Create indices for bottom face (reversed winding for correct normals)
  if (originalGeometry.index) {
    const origIndices = originalGeometry.index.array
    for (let i = 0; i < origIndices.length; i += 3) {
      newIndices.push(origIndices[i + 2], origIndices[i + 1], origIndices[i])
    }
  }

  // Create indices for top face
  if (originalGeometry.index) {
    const origIndices = originalGeometry.index.array
    for (let i = 0; i < origIndices.length; i += 3) {
      newIndices.push(origIndices[i] + vertexCount, origIndices[i + 1] + vertexCount, origIndices[i + 2] + vertexCount)
    }
  }

  // Create side faces by finding boundary edges
  // An edge is a boundary edge if it's only used by one triangle
  const edgeCount = new Map<string, number>()
  const edgeVertices = new Map<string, [number, number]>()

  if (originalGeometry.index) {
    const origIndices = originalGeometry.index.array
    for (let i = 0; i < origIndices.length; i += 3) {
      const a = origIndices[i]
      const b = origIndices[i + 1]
      const c = origIndices[i + 2]

      // Check each edge of the triangle
      const edges: Array<[number, number]> = [
        [a, b],
        [b, c],
        [c, a],
      ]

      edges.forEach(([v1, v2]) => {
        // Create consistent edge key (sorted)
        const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`
        edgeCount.set(key, (edgeCount.get(key) || 0) + 1)
        // Store the original order for winding
        if (!edgeVertices.has(key)) {
          edgeVertices.set(key, [v1, v2])
        }
      })
    }
  }

  // Create side quads only for boundary edges (edges with count === 1)
  edgeVertices.forEach(([v1, v2], key) => {
    if (edgeCount.get(key) === 1) {
      const bottom1 = v1
      const bottom2 = v2
      const top1 = v1 + vertexCount
      const top2 = v2 + vertexCount

      // Two triangles per quad
      newIndices.push(bottom1, bottom2, top1)
      newIndices.push(bottom2, top2, top1)
    }
  })

  // Create the extruded geometry
  const extrudedGeometry = new BufferGeometry()
  extrudedGeometry.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3))
  extrudedGeometry.setIndex(newIndices)

  // Add roomId as a vertex attribute for click detection after merging
  const roomIdArray = new Float32Array(newPositions.length / 3).fill(roomId)
  extrudedGeometry.setAttribute("roomId", new THREE.BufferAttribute(roomIdArray, 1))

  extrudedGeometry.computeVertexNormals()

  // Apply Y offset
  extrudedGeometry.translate(0, yOffset, 0)

  // Calculate bounds for click detection
  const bounds = new Box3().setFromBufferAttribute(extrudedGeometry.attributes.position as THREE.BufferAttribute)

  return {
    geometry: extrudedGeometry,
    roomName: mesh.name || "",
    bounds,
  }
}

// Main merged floor component
interface MergedFloorInstancesProps {
  isVisible: boolean
  floorNumber: number
  floorData: {
    building: string
    rooms?: any
    stairs?: any
    lift?: any
    doors?: any
    floor?: any
    poi?: any
    displayMode: "primary" | "context" | "hidden"
  }[]
  searchQuery: string
  opacityOverride?: number
  pickingOnly?: boolean
}

const MergedFloorInstances: React.FC<MergedFloorInstancesProps> = ({
  isVisible,
  floorNumber,
  floorData,
  searchQuery,
  opacityOverride,
  pickingOnly = false,
}) => {
  const [currentFloor] = useAtom(currentFloorAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [currentMode] = useAtom(currentModeAtom)
  const [selectedRoomTypes] = useAtom(selectedRoomTypesAtom)
  const [selectedInstitution] = useAtom(selectedInstitutionAtom)
  const [showAllPOIs] = useAtom(showAllPOIsAtom)
  const [, setPoiSidebarOpen] = useAtom(poiDataSidebarOpenAtom)
  const [, setSelectedPoiId] = useAtom(selectedPoiIdAtom)
  const { makeRoomOnClick } = useClickHandler()

  const OPACITY = opacityOverride ?? 1

  // Room ID to name mapping
  const roomIdToNameRef = React.useRef<Map<number, string>>(new Map())

  // Process all meshes and merge by color - use roomId vertex attribute for click detection
  const mergedData = useMemo(() => {
    // Clear and rebuild room ID mapping
    roomIdToNameRef.current.clear()
    let nextRoomId = 1 // Start from 1, 0 is for non-rooms

    // Store geometries by color for rooms
    const roomGeometriesByColor: Map<string, { geometries: BufferGeometry[]; color: string }> = new Map()

    // Store geometries by type for non-rooms (stairs, lifts, floors)
    const nonRoomGeometriesByType: Map<string, { geometries: BufferGeometry[]; color: string; type: string }> =
      new Map()

    // Always use primary colors for search highlights (regardless of context/primary mode)
    const PRIMARY_COLORS = generateColorShades("#051230", 4, true, undefined, [60, 80])
    // Use the 3rd floor shade as a single consistent highlight color
    const HIGHLIGHT_BLUE = PRIMARY_COLORS[3]

    floorData.forEach(({ building, rooms, stairs, lift, doors, floor, poi, displayMode }) => {
      if (displayMode === "hidden") return

      const shouldShow =
        !isSearchMode || searchQuery.length < 2 || displayMode === "primary" || displayMode === "context"

      if (!shouldShow) return

      // Process rooms - assign unique ID to each room and merge by color
      if (rooms?.scene) {
        const roomMeshes = rooms.scene.children.filter((child: any) => child.isMesh)
        roomMeshes.forEach((mesh: Mesh) => {
          // Skip rooms entirely when showing all POIs or when POI filter is active
          if (showAllPOIs) {
            return
          }

          let roomColor = COLOR_ROOM_NOT_FOUND

          // Apply roomtype coloring - only render matching rooms
          if (currentMode === "roomtype" && selectedRoomTypes.length > 0) {
            // Skip rooms entirely for elevation filters (stairs/lift) or POI filters
            if (
              selectedRoomTypes.includes("elevation:stairs") ||
              selectedRoomTypes.includes("elevation:lift") ||
              selectedRoomTypes.some((type) => type.startsWith("poi:"))
            ) {
              return
            }
            const roomName = String(mesh.name || "")
            // Check if this room is in any of the selected room types
            let isMatchingRoom = false
            selectedRoomTypes.forEach((roomType) => {
              // Use getRoomNumbersForFilter to support both types and subtypes
              const rooms = getRoomNumbersForFilter(roomType)
              if (Array.isArray(rooms) && rooms.includes(roomName)) {
                isMatchingRoom = true
              }
            })

            if (isMatchingRoom) {
              // If a specific room is selected (clicked), highlight it and dim others
              if (searchQuery && searchQuery.length > 0) {
                roomColor = roomName === searchQuery ? "coral" : COLOR_ROOM_NOT_FOUND
              } else {
                roomColor = "coral"
              }
            } else {
              return // Skip non-matching rooms entirely
            }
          }
          // Apply institution coloring - only render matching rooms
          else if (currentMode === "institution" && selectedInstitution) {
            const roomName = String(mesh.name || "")
            const institutionRooms = getRoomNumbersForFilter(`institution:${selectedInstitution}`)
            if (institutionRooms.includes(roomName)) {
              roomColor = "coral"
            } else {
              return // Skip non-matching rooms entirely
            }
          }
          // Apply search coloring
          else if (isSearchMode && searchQuery.length >= 2) {
            const roomName = String(mesh.name || "")
            if (roomName === searchQuery) {
              roomColor = "coral"
            } else if (roomName.startsWith(searchQuery)) {
              // Use a single consistent light blue for all matching rooms
              roomColor = HIGHLIGHT_BLUE
            } else {
              roomColor = COLOR_ROOM_NOT_FOUND
            }
          }
          // When search is active but no meaningful query yet, dim all rooms
          else if (isSearchMode) {
            roomColor = COLOR_ROOM_NOT_FOUND
          }

          const roomId = nextRoomId++
          const roomName = mesh.name || ""
          roomIdToNameRef.current.set(roomId, roomName)

          // Compute height with optional per-room override (increase or decrease)
          const nameKey = String(roomName).trim()
          const heightMultiplier = ROOM_HEIGHT_OVERRIDES[nameKey]
          let targetHeight = DEFAULT_ROOM_HEIGHT
          if (typeof heightMultiplier === "number") {
            targetHeight = DEFAULT_ROOM_HEIGHT * heightMultiplier + (heightMultiplier > 1 ? DOUBLE_HEIGHT_EPSILON : 0)
          }

          const extruded = extrudeMeshGeometry(mesh, targetHeight, ROOM_POSITION_OFFSET, PADDING, roomId)

          const key = `room-${roomColor}`
          if (!roomGeometriesByColor.has(key)) {
            roomGeometriesByColor.set(key, { geometries: [], color: roomColor })
          }

          roomGeometriesByColor.get(key)!.geometries.push(extruded.geometry)
        })
      }

      // Detect elevation filter selections
      const showOnlyStairs = selectedRoomTypes.includes("elevation:stairs")
      const showOnlyLift = selectedRoomTypes.includes("elevation:lift")
      const isElevationFilter = showOnlyStairs || showOnlyLift

      // Detect POI filter selections
      const showOnlyPOIs = selectedRoomTypes.some((type) => type.startsWith("poi:"))
      const isPOIFilter = showOnlyPOIs

      // In institution/roomtype mode, skip all non-room elements (unless elevation or POI filter is active)
      const skipNonRooms =
        (currentMode === "institution" && !!selectedInstitution) ||
        (currentMode === "roomtype" && selectedRoomTypes.length > 0 && !isElevationFilter && !isPOIFilter)

      // Process stairs - merge them (only show when elevation:stairs is active or no elevation filter)
      // Hide when showing all POIs or POI filter is active
      if (stairs?.scene && (!skipNonRooms || showOnlyStairs) && !showOnlyLift && !showAllPOIs && !showOnlyPOIs) {
        const stairMeshes = stairs.scene.children.filter((child: any) => child.isMesh)
        stairMeshes.forEach((mesh: Mesh) => {
          const key = `stairs-${COLOR_STAIRS}`
          if (!nonRoomGeometriesByType.has(key)) {
            nonRoomGeometriesByType.set(key, { geometries: [], color: COLOR_STAIRS, type: "stairs" })
          }

          const extruded = extrudeMeshGeometry(mesh, 3.3, ROOM_POSITION_OFFSET, 0.4, 0)
          nonRoomGeometriesByType.get(key)!.geometries.push(extruded.geometry)
        })
      }

      // Process lift - merge them (only show when elevation:lift is active or no elevation filter)
      // Hide when showing all POIs or POI filter is active
      if (lift?.scene && (!skipNonRooms || showOnlyLift) && !showOnlyStairs && !showAllPOIs && !showOnlyPOIs) {
        const liftMeshes = lift.scene.children.filter((child: any) => child.isMesh)
        liftMeshes.forEach((mesh: Mesh) => {
          const key = `lift-${COLOR_LIFT}`
          if (!nonRoomGeometriesByType.has(key)) {
            nonRoomGeometriesByType.set(key, { geometries: [], color: COLOR_LIFT, type: "lift" })
          }

          const extruded = extrudeMeshGeometry(mesh, 3.3, ROOM_POSITION_OFFSET, PADDING, 0)
          nonRoomGeometriesByType.get(key)!.geometries.push(extruded.geometry)
        })
      }

      // Process doors - merge them
      // Hide when showing all POIs or POI filter is active
      if (doors?.scene && !skipNonRooms && !isElevationFilter && !showAllPOIs && !showOnlyPOIs) {
        const doorMeshes = doors.scene.children.filter((child: any) => child.isMesh)
        doorMeshes.forEach((mesh: Mesh) => {
          const key = `doors-${COLOR_DOORS}`
          if (!nonRoomGeometriesByType.has(key)) {
            nonRoomGeometriesByType.set(key, { geometries: [], color: COLOR_DOORS, type: "doors" })
          }

          const extruded = extrudeMeshGeometry(mesh, 2.2, ROOM_POSITION_OFFSET, 0, 0)
          nonRoomGeometriesByType.get(key)!.geometries.push(extruded.geometry)
        })
      }

      // Process floor - merge them
      // Hide when showing all POIs or POI filter is active
      if (floor?.scene && !skipNonRooms && !isElevationFilter && !showAllPOIs && !showOnlyPOIs) {
        const floorMeshes = floor.scene.children.filter((child: any) => child.isMesh)
        floorMeshes.forEach((mesh: Mesh) => {
          const key = `floor-#4c4c4c`
          if (!nonRoomGeometriesByType.has(key)) {
            nonRoomGeometriesByType.set(key, { geometries: [], color: "#4c4c4c", type: "floor" })
          }

          const extruded = extrudeMeshGeometry(mesh, 0.3, -1.5, PADDING_FLOOR, 0)
          nonRoomGeometriesByType.get(key)!.geometries.push(extruded.geometry)
        })
      }

      // Process POI (Points of Interest) - merge them
      // Show POIs when: no filter is active, POI filter is active, or showAllPOIs is enabled
      if (poi?.scene && ((!skipNonRooms && !isElevationFilter) || showOnlyPOIs || showAllPOIs)) {
        const poiMeshes = poi.scene.children.filter((child: any) => child.isMesh)
        poiMeshes.forEach((mesh: Mesh) => {
          const key = `poi-${COLOR_POI}`
          if (!nonRoomGeometriesByType.has(key)) {
            nonRoomGeometriesByType.set(key, { geometries: [], color: COLOR_POI, type: "poi" })
          }

          const extruded = extrudeMeshGeometry(mesh, DEFAULT_ROOM_HEIGHT - 1, 0, 0, 0)
          nonRoomGeometriesByType.get(key)!.geometries.push(extruded.geometry)
        })
      }
    })

    // Merge room geometries by color
    const mergedRooms: Array<{
      geometry: BufferGeometry
      color: string
      type: string
    }> = []

    roomGeometriesByColor.forEach((data, key) => {
      if (data.geometries.length === 0) return

      const mergedGeometry = BufferGeometryUtils.mergeGeometries(data.geometries, false)

      if (mergedGeometry) {
        mergedRooms.push({
          geometry: mergedGeometry,
          color: data.color,
          type: "room",
        })
      }
    })

    // Merge non-room geometries
    const mergedNonRooms: Array<{
      geometry: BufferGeometry
      color: string
      type: string
    }> = []

    nonRoomGeometriesByType.forEach((data, key) => {
      if (data.geometries.length === 0) return

      const mergedGeometry = BufferGeometryUtils.mergeGeometries(data.geometries)

      if (mergedGeometry) {
        mergedNonRooms.push({
          geometry: mergedGeometry,
          color: data.color,
          type: data.type,
        })
      }
    })

    return { mergedRooms, mergedNonRooms }
  }, [
    floorData,
    searchQuery,
    floorNumber,
    isSearchMode,
    currentMode,
    selectedRoomTypes,
    selectedInstitution,
    showAllPOIs,
  ])

  // Handle room click - extract roomId from intersection and look up room name
  const handleRoomClick = (e: ThreeEvent<MouseEvent>) => {
    // Get the face that was clicked
    if (!e.face) return

    // Get the mesh that was clicked
    const mesh = e.object as THREE.Mesh
    const geometry = mesh.geometry as BufferGeometry

    // Check if this geometry has roomId attribute
    if (!geometry.attributes.roomId) return

    // Get the roomId from the first vertex of the clicked face
    const roomIdAttr = geometry.attributes.roomId
    const faceIndex = e.faceIndex!

    // Get the first vertex index of the triangle
    let vertexIndex: number
    if (geometry.index) {
      vertexIndex = geometry.index.getX(faceIndex * 3)
    } else {
      vertexIndex = faceIndex * 3
    }

    const roomId = roomIdAttr.getX(vertexIndex)

    // Look up the room name from the roomId
    const roomName = roomIdToNameRef.current.get(roomId)

    if (!roomName || roomId === 0) return // roomId 0 is for non-rooms

    const clickHandler = makeRoomOnClick({
      roomKey: roomName,
      floorNumber,
      isVisible,
    })

    clickHandler(e)
  }

  // Handle POI click - open POI sidebar
  const handlePOIClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // For now, set a generic POI ID - later can be enhanced to identify specific POIs
    setSelectedPoiId(`poi-floor-${floorNumber}`)
    setPoiSidebarOpen(true)
  }

  return (
    <group visible={isVisible}>
      {/* Render merged rooms - uses roomId attribute for click detection */}
      {mergedData.mergedRooms.map((room, index) => (
        <mesh key={`room-merged-${index}`} geometry={room.geometry} onClick={handleRoomClick}>
          <meshBasicMaterial
            color={room.color}
            colorWrite={!pickingOnly}
            depthWrite={!pickingOnly}
            depthTest={!pickingOnly}
            transparent={true}
            opacity={OPACITY}
            side={THREE.DoubleSide}
          />
          {!pickingOnly && (
            <Outlines
              //
              thickness={2}
              color={COLOR_OUTLINES}
              transparent
            />
          )}
        </mesh>
      ))}

      {/* Render merged non-room elements (stairs, lifts, floors, POIs) */}
      {mergedData.mergedNonRooms.map((element, index) => (
        <mesh
          key={`${element.type}-${index}`}
          geometry={element.geometry}
          onClick={element.type === "poi" ? handlePOIClick : undefined}
        >
          <meshBasicMaterial
            color={element.color}
            colorWrite={!pickingOnly}
            depthWrite={!pickingOnly}
            depthTest={!pickingOnly}
            transparent={true}
            opacity={OPACITY}
            side={THREE.DoubleSide}
          />
          {!pickingOnly && (
            <Outlines
              //
              thickness={2}
              color={COLOR_OUTLINES}
              transparent
            />
          )}
        </mesh>
      ))}
    </group>
  )
}

// Main FloorPlanMerged component
type FloorPlanMergedProps = {
  pickingOnly?: boolean
}

const FloorPlanMerged: React.FC<FloorPlanMergedProps> = ({ pickingOnly = false }) => {
  const joinedf03 = useGLTF(`${path}/models/floors/model-floor03-joined.glb`)
  const joinedf02 = useGLTF(`${path}/models/floors/model-floor02-joined.glb`)
  const joinedf01 = useGLTF(`${path}/models/floors/model-floor01-joined.glb`)
  const joinedf00 = useGLTF(`${path}/models/floors/model-floor00-joined.glb`)
  const joinedfUG = useGLTF(`${path}/models/floors/model-floorUG-joined.glb`)

  const [currentMode] = useAtom(currentModeAtom)
  const floorPlanData = useFloorPlanData()
  const [searchQuery, setSearchQuery] = useAtom(searchRoomAtom)
  const [showFloorPlan] = useAtom(showFloorPlanAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [isLocked] = useAtom(isRoomLockedAtom)
  const [showAllFloorsInSearch] = useAtom(showAllFloorsInSearchAtom)
  const [currentFloor, setCurrentFloor] = useAtom(currentFloorAtom)
  const [selectedInstitution] = useAtom(selectedInstitutionAtom)
  const [showAllPOIs] = useAtom(showAllPOIsAtom)

  // Hide floor slab models in institution/roomtype mode or when showing all POIs
  const hideFloorModel =
    (currentMode === "institution" && !!selectedInstitution) || currentMode === "roomtype" || showAllPOIs

  // Parse search query to extract floor (skip in roomtype/institution mode to keep all floors visible)
  useEffect(() => {
    if (currentMode === "roomtype" || currentMode === "institution") return
    if (searchQuery && searchQuery.length >= 2) {
      const firstChar = searchQuery.charAt(0)
      let floorLevel: number
      if (firstChar.toUpperCase() === "U") {
        floorLevel = -1 // UG floor
      } else {
        floorLevel = parseInt(firstChar, 10)
      }
      if (!isNaN(floorLevel) && floorLevel >= -1 && floorLevel <= 4) {
        setCurrentFloor(floorLevel)
      }
    }
  }, [searchQuery, setCurrentFloor, currentMode])

  // Clear active room selection when floor changes
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const firstChar = searchQuery.charAt(0)
      let searchFloor: number
      if (firstChar.toUpperCase() === "U") {
        searchFloor = -1 // UG floor
      } else {
        searchFloor = parseInt(firstChar, 10)
      }
      if (!isNaN(searchFloor) && searchFloor !== currentFloor && !isLocked) {
        setSearchQuery("")
      }
    }
  }, [currentFloor, isLocked])

  const { level4, level3, level2, level1, level0, levelUG, gapUG0, gap01, gap12, gap23, gap34 } = useControls(
    "🗺️ Floor Plan Merged",
    {
      level4: true,
      level3: true,
      level2: true,
      level1: true,
      level0: true,
      levelUG: true,
      gapUG0: { value: 0, min: 0, max: 10, step: 0.05, label: "Gap UG→0 (Y)" },
      gap01: { value: 0, min: 0, max: 10, step: 0.05, label: "Gap 0→1 (Y)" },
      gap12: { value: 0, min: 0, max: 10, step: 0.05, label: "Gap 1→2 (Y)" },
      gap23: { value: 0, min: 0, max: 10, step: 0.05, label: "Gap 2→3 (Y)" },
      gap34: { value: 0, min: 0, max: 10, step: 0.05, label: "Gap 3→4 (Y)" },
      search: {
        value: searchQuery,
        onChange: (e) => setSearchQuery(e),
      },
    },
    { collapsed: true }
  )

  const y = useMemo(() => {
    const yUG = 0
    const y0 = yUG + gapUG0
    const y1 = y0 + gap01
    const y2 = y1 + gap12
    const y3 = y2 + gap23
    const y4 = y3 + gap34
    return [yUG, y0, y1, y2, y3, y4]
  }, [gapUG0, gap01, gap12, gap23, gap34])

  const handleVisibility = (floor: number) => {
    // When showing all POIs, show all floors
    if (showAllPOIs) {
      return !showFloorPlan
    }

    if (currentMode === "floors") {
      return currentFloor === floor && !showFloorPlan
    }

    // In roomtype mode, show all floors if currentFloor is 4 (roof view)
    // Otherwise, show only the selected floor
    if (currentMode === "roomtype") {
      if (currentFloor === 4) {
        return !showFloorPlan // Show all floors
      }
      return currentFloor === floor && !showFloorPlan // Show only selected floor
    }

    // In institution mode, show all floors if currentFloor is 4 (roof view)
    // Otherwise, show only the selected floor
    if (currentMode === "institution") {
      if (currentFloor === 4) {
        return !showFloorPlan // Show all floors
      }
      return currentFloor === floor && !showFloorPlan // Show only selected floor
    }

    if (isSearchMode && currentMode === "search") {
      if (showAllFloorsInSearch) {
        return true
      }

      if (searchQuery.length >= 1) {
        const firstChar = searchQuery.charAt(0)
        let searchFloor: number
        if (firstChar.toUpperCase() === "U") {
          searchFloor = -1 // UG floor
        } else {
          searchFloor = parseInt(firstChar, 10)
        }
        if (!isNaN(searchFloor) && searchFloor >= -1 && searchFloor <= 4) {
          return floor === searchFloor
        }
      }
      return true
    }

    return currentFloor === floor && !showFloorPlan
  }

  const getBuildingDisplayMode = (floor: number, buildingNumber: string) => {
    // When showing all POIs, show all buildings in primary mode
    if (showAllPOIs) {
      return "primary"
    }

    if (currentMode === "floors") {
      return "primary"
    }

    // In roomtype mode, show all buildings in primary mode
    if (currentMode === "roomtype") {
      return "primary"
    }

    // In institution mode, show all buildings in primary mode
    if (currentMode === "institution") {
      return "primary"
    }

    if (currentMode === "search" && isSearchMode && searchQuery.length >= 1) {
      const firstChar = searchQuery.charAt(0)
      let searchFloor: number
      if (firstChar.toUpperCase() === "U") {
        searchFloor = -1 // UG floor
      } else {
        searchFloor = parseInt(firstChar, 10)
      }
      if (isNaN(searchFloor)) return "primary"

      if (showAllFloorsInSearch) {
        if (searchQuery.length === 1) {
          return floor === searchFloor ? "primary" : "context"
        }

        const searchBuilding = searchQuery.charAt(1)
        if (floor === searchFloor && buildingNumber === searchBuilding) {
          return "primary"
        }
        return "context"
      }

      if (searchQuery.length >= 2) {
        const searchBuilding = searchQuery.charAt(1)

        if (floor === searchFloor && buildingNumber !== searchBuilding) {
          return "context"
        }

        if (floor === searchFloor && buildingNumber === searchBuilding) {
          return "primary"
        }

        return "hidden"
      }
    }

    return "primary"
  }

  const computedOpacity = pickingOnly ? 0.001 : 1

  return (
    <group position={[0, 0, 0]}>
      <group name="floorUG" position={[0, y[0], 0]}>
        <MergedFloorInstances
          isVisible={handleVisibility(-1) && levelUG}
          floorNumber={-1}
          searchQuery={searchQuery}
          opacityOverride={computedOpacity}
          pickingOnly={pickingOnly}
          floorData={[
            {
              building: "3",
              rooms: floorPlanData.b03.fug.rooms,
              // doors: floorPlanData.b03.fug.doors,
              displayMode: getBuildingDisplayMode(-1, "3"),
              stairs: floorPlanData.b03.fug.stairs,
              lift: floorPlanData.b03.fug.lift,
            },
            {
              building: "4",
              rooms: floorPlanData.b04.fug.rooms,
              displayMode: getBuildingDisplayMode(-1, "4"),
            },
          ]}
        />
        <CustomFloor
          modelScene={joinedfUG.scene}
          isVisible={handleVisibility(-1) && levelUG && !hideFloorModel}
          color={COLOR_FLOOR}
          pickingOnly={pickingOnly}
          opacityOverride={computedOpacity}
        />
      </group>

      <group name="floor0" position={[0, y[1], 0]}>
        <MergedFloorInstances
          isVisible={handleVisibility(0) && level0}
          floorNumber={0}
          searchQuery={searchQuery}
          opacityOverride={computedOpacity}
          pickingOnly={pickingOnly}
          floorData={[
            {
              building: "1",
              rooms: floorPlanData.b01.f00.rooms,
              stairs: floorPlanData.b01.f00.stairs,
              lift: floorPlanData.b01.f00.lift,
              displayMode: getBuildingDisplayMode(0, "1"),
            },
            {
              building: "2",
              rooms: floorPlanData.b02.f00.rooms,
              stairs: floorPlanData.b02.f00.stairs,
              lift: floorPlanData.b02.f00.lift,
              displayMode: getBuildingDisplayMode(0, "2"),
            },
            {
              building: "3",
              rooms: floorPlanData.b03.f00.rooms,
              displayMode: getBuildingDisplayMode(0, "3"),
              stairs: floorPlanData.b03.f00.stairs,
              lift: floorPlanData.b03.f00.lift,
            },
            {
              building: "4",
              rooms: floorPlanData.b04.f00.rooms,
              displayMode: getBuildingDisplayMode(0, "4"),
            },
            {
              building: "5",
              rooms: floorPlanData.b05.f00.rooms,
              stairs: floorPlanData.b05.f00.stairs,
              lift: floorPlanData.b05.f00.lift,
              displayMode: getBuildingDisplayMode(0, "5"),
            },
            {
              building: "7",
              rooms: floorPlanData.b07.f00.rooms,
              displayMode: getBuildingDisplayMode(0, "7"),
            },
          ]}
        />
        <CustomFloor
          modelScene={joinedf00.scene}
          isVisible={handleVisibility(0) && level0 && !hideFloorModel}
          color={COLOR_FLOOR}
          pickingOnly={pickingOnly}
          opacityOverride={computedOpacity}
        />
      </group>

      <group name="floor1" position={[0, y[2], 0]}>
        <MergedFloorInstances
          isVisible={handleVisibility(1) && level1}
          floorNumber={1}
          searchQuery={searchQuery}
          opacityOverride={computedOpacity}
          pickingOnly={pickingOnly}
          floorData={[
            {
              building: "1",
              rooms: floorPlanData.b01.f01.rooms,
              stairs: floorPlanData.b01.f01.stairs,
              lift: floorPlanData.b01.f01.lift,
              displayMode: getBuildingDisplayMode(1, "1"),
            },
            {
              building: "2",
              rooms: floorPlanData.b02.f01.rooms,
              stairs: floorPlanData.b02.f01.stairs,
              lift: floorPlanData.b02.f01.lift,
              displayMode: getBuildingDisplayMode(1, "2"),
            },
            {
              building: "3",
              rooms: floorPlanData.b03.f01.rooms,
              displayMode: getBuildingDisplayMode(1, "3"),
              stairs: floorPlanData.b03.f01.stairs,
              lift: floorPlanData.b03.f01.lift,
              poi: floorPlanData.b03.f01.poi,
            },
            {
              building: "4",
              rooms: floorPlanData.b04.f01.rooms,
              displayMode: getBuildingDisplayMode(1, "4"),
            },
            {
              building: "5",
              rooms: floorPlanData.b05.f01.rooms,
              stairs: floorPlanData.b05.f01.stairs,
              lift: floorPlanData.b05.f01.lift,
              displayMode: getBuildingDisplayMode(1, "5"),
            },
          ]}
        />
        <CustomFloor
          modelScene={joinedf01.scene}
          isVisible={handleVisibility(1) && level1 && !hideFloorModel}
          color={COLOR_FLOOR}
          pickingOnly={pickingOnly}
          opacityOverride={computedOpacity}
        />
      </group>

      <group name="floor2" position={[0, y[3], 0]}>
        <MergedFloorInstances
          isVisible={handleVisibility(2) && level2}
          floorNumber={2}
          searchQuery={searchQuery}
          opacityOverride={computedOpacity}
          pickingOnly={pickingOnly}
          floorData={[
            {
              building: "1",
              rooms: floorPlanData.b01.f02.rooms,
              stairs: floorPlanData.b01.f02.stairs,
              lift: floorPlanData.b01.f02.lift,
              displayMode: getBuildingDisplayMode(2, "1"),
            },
            {
              building: "2",
              rooms: floorPlanData.b02.f02.rooms,
              stairs: floorPlanData.b02.f02.stairs,
              lift: floorPlanData.b02.f02.lift,
              displayMode: getBuildingDisplayMode(2, "2"),
            },
          ]}
        />
        <CustomFloor
          modelScene={joinedf02.scene}
          isVisible={handleVisibility(2) && level2 && !hideFloorModel}
          color={COLOR_FLOOR}
          pickingOnly={pickingOnly}
          opacityOverride={computedOpacity}
        />
      </group>

      <group name="floor3" position={[0, y[4], 0]}>
        <MergedFloorInstances
          isVisible={handleVisibility(3) && level3}
          floorNumber={3}
          searchQuery={searchQuery}
          opacityOverride={computedOpacity}
          pickingOnly={pickingOnly}
          floorData={[
            {
              building: "1",
              rooms: floorPlanData.b01.f03.rooms,
              stairs: floorPlanData.b01.f03.stairs,
              lift: floorPlanData.b01.f03.lift,
              displayMode: getBuildingDisplayMode(3, "1"),
            },
            {
              building: "2",
              rooms: floorPlanData.b02.f03.rooms,
              stairs: floorPlanData.b02.f03.stairs,
              lift: floorPlanData.b02.f03.lift,
              displayMode: getBuildingDisplayMode(3, "2"),
            },
          ]}
        />
        <CustomFloor
          modelScene={joinedf03.scene}
          isVisible={handleVisibility(3) && level3 && !hideFloorModel}
          color={COLOR_FLOOR}
          pickingOnly={pickingOnly}
          opacityOverride={computedOpacity}
        />
      </group>

      <group name="floor4" visible={handleVisibility(4)} position={[0, y[5], 0]}></group>
    </group>
  )
}

export default FloorPlanMerged
