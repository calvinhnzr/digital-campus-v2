import React, { useMemo } from "react"
import * as THREE from "three"
import { useAtom } from "jotai"

import { searchRoomAtom } from "@/store/atom"
import { useFloorPlanData } from "@/hooks/useFloorPlanData"
import { RoomInfoCard3D } from "@/components/hud/RoomInfoCard3D"

const CardLayer: React.FC<{ animate?: boolean }> = ({ animate = true }) => {
  const [searchQuery] = useAtom(searchRoomAtom)

  // load all GLTFs from the useFloorPlanData hook
  const floorPlanData = useFloorPlanData()

  const matches = useMemo(() => {
    if (!searchQuery) return []

    console.log("CardLayer searching for:", searchQuery)
    const found: Array<{ position: [number, number, number]; key: string }> = []

    // Iterate through all buildings and floors in the floorPlanData
    Object.entries(floorPlanData).forEach(([buildingKey, building]) => {
      Object.entries(building).forEach(([floorKey, floor]) => {
        const roomsGltf = floor.rooms
        if (!roomsGltf?.scene) return

        roomsGltf.scene.traverse((child: any) => {
          if (!child || !child.isMesh) return

          // mesh.name expected to be the room identifier
          if (child.name === searchQuery) {
            const box = new THREE.Box3().setFromObject(child)
            const center = box.getCenter(new THREE.Vector3())
            found.push({ position: [center.x, center.y, center.z], key: `${child.name}-${child.uuid}` })
          }
        })
      })
    })

    console.log("SearchHighlightLayer found matches:", found)
    return found
  }, [floorPlanData, searchQuery])

  if (!searchQuery) return null

  return (
    <>
      {matches.map((m, i) => (
        <RoomInfoCard3D key={m.key} roomNumber={searchQuery} position={m.position} />
      ))}
    </>
  )
}

export default CardLayer
