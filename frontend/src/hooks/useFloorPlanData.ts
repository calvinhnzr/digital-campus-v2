import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { path } from "@/store/base"
import { groupChildren } from "@/utils/helpers/groupChildren"

export const useFloorPlanData = () => {
  const fpRoomsCompressed = useGLTF(`${path}/floorplan/fp-rooms-compressed.glb`)
  const fpStairsCompressed = useGLTF(`${path}/floorplan/fp-stairs-compressed.glb`)
  const fpLiftCompressed = useGLTF(`${path}/floorplan/fp-lift-compressed.glb`)
  const fpPOICompressed = useGLTF(`${path}/floorplan/fp-poi-compressed.glb`)
  // console.log("FP Rooms Compressed:", fpRoomsCompressed) // Debugging log to check the structure of the loaded GLTF

  // Group children nodes by their parent, wrapped as { scene: group } to match GLTF result shape

  const groupedRooms = useMemo(() => groupChildren(fpRoomsCompressed), [fpRoomsCompressed])
  const groupedStairs = useMemo(() => groupChildren(fpStairsCompressed), [fpStairsCompressed])
  const groupedLift = useMemo(() => groupChildren(fpLiftCompressed), [fpLiftCompressed])
  const groupedPOI = useMemo(() => groupChildren(fpPOICompressed), [fpPOICompressed])

  return useMemo(
    () => ({
      b01: {
        f00: {
          rooms: groupedRooms["fp-b01-f00-rooms"],
          stairs: groupedStairs["fp-b01-f00-stairs"],
          lift: groupedLift["fp-b01-f00-lift"],
        },
        f01: {
          rooms: groupedRooms["fp-b01-f01-rooms"],
          stairs: groupedStairs["fp-b01-f01-stairs"],
          lift: groupedLift["fp-b01-f01-lift"],
        },
        f02: {
          rooms: groupedRooms["fp-b01-f02-rooms"],
          stairs: groupedStairs["fp-b01-f02-stairs"],
          lift: groupedLift["fp-b01-f02-lift"],
        },
        f03: {
          rooms: groupedRooms["fp-b01-f03-rooms"],
          stairs: groupedStairs["fp-b01-f03-stairs"],
          lift: groupedLift["fp-b01-f03-lift"],
        },
      },
      b02: {
        f00: {
          rooms: groupedRooms["fp-b02-f00-rooms"],
          stairs: groupedStairs["fp-b02-f00-stairs"],
          lift: groupedLift["fp-b02-f00-lift"],
          poi: groupedPOI["fp-b02-f00-poi"],
        },
        f01: {
          rooms: groupedRooms["fp-b02-f01-rooms"],
          stairs: groupedStairs["fp-b02-f01-stairs"],
          lift: groupedLift["fp-b02-f01-lift"],
        },
        f02: {
          rooms: groupedRooms["fp-b02-f02-rooms"],
          stairs: groupedStairs["fp-b02-f02-stairs"],
          lift: groupedLift["fp-b02-f02-lift"],
        },
        f03: {
          rooms: groupedRooms["fp-b02-f03-rooms"],
          stairs: groupedStairs["fp-b02-f03-stairs"],
          lift: groupedLift["fp-b02-f03-lift"],
        },
      },
      b03: {
        fug: {
          rooms: groupedRooms["fp-b03-fug-rooms"],
          stairs: groupedStairs["fp-b03-fug-stairs"],
          lift: groupedLift["fp-b03-fug-lift"],
        },
        f00: {
          rooms: groupedRooms["fp-b03-f00-rooms"],
          stairs: groupedStairs["fp-b03-f00-stairs"],
          lift: groupedLift["fp-b03-f00-lift"],
        },
        f01: {
          rooms: groupedRooms["fp-b03-f01-rooms"],
          stairs: groupedStairs["fp-b03-f01-stairs"],
          lift: groupedLift["fp-b03-f01-lift"],
          poi: groupedPOI["fp-b03-f01-poi"],
        },
      },
      b04: {
        fug: { rooms: groupedRooms["fp-b04-fug-rooms"] },
        f00: { rooms: groupedRooms["fp-b04-f00-rooms"] },
        f01: { rooms: groupedRooms["fp-b04-f01-rooms"] },
      },
      b05: {
        f00: {
          rooms: groupedRooms["fp-b05-f00-rooms"],
          stairs: groupedStairs["fp-b05-f00-stairs"],
          lift: groupedLift["fp-b05-f00-lift"],
        },
        f01: {
          rooms: groupedRooms["fp-b05-f01-rooms"],
          stairs: groupedStairs["fp-b05-f01-stairs"],
          lift: groupedLift["fp-b05-f01-lift"],
        },
      },

      b07: {
        f00: { rooms: groupedRooms["fp-b07-f00-rooms"] },
      },
    }),
    [groupedRooms, groupedStairs, groupedLift]
  )
}
