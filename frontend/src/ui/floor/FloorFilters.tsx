import React from "react"
import { useAtom } from "jotai"
import {
  currentFloorAtom,
  currentModeAtom,
  isSearchModeAtom,
  searchRoomAtom,
  searchFocusedAtom,
  isRoomLockedAtom,
  selectedRoomTypesAtom,
  filterQueryAtom,
} from "@/store/atom"
import { FloorItem } from "./FloorItem"
import { FloorCycleButton } from "./FloorCycleButton"
import "./FloorFilters.css"
import type { UIMode } from "@/ui/Layout"
import { getRoomNumbersForFilter } from "@/data/rooms"

// Floors to display; could be made dynamic later
const FLOORS = ["-1", "0", "1", "2", "3", "4"]

interface FloorFiltersProps {
  mode?: UIMode
}

const FloorFilters: React.FC<FloorFiltersProps> = ({ mode = "default" }) => {
  const [currentFloor, setCurrentFloor] = useAtom(currentFloorAtom)
  const [currentMode, setCurrentMode] = useAtom(currentModeAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchRoomAtom)
  const [, setSearchFocused] = useAtom(searchFocusedAtom)
  const [isLocked] = useAtom(isRoomLockedAtom)
  const [selectedRoomTypes, setSelectedRoomTypes] = useAtom(selectedRoomTypesAtom)
  const [, setFilterQuery] = useAtom(filterQueryAtom)

  const groupId = React.useId()

  // Effect to update currentFloor based on search query (first digit or "U" for UG)
  React.useEffect(() => {
    if (currentMode === "search" && searchQuery.length >= 1) {
      const firstChar = searchQuery.charAt(0)
      let searchFloor: number
      if (firstChar.toUpperCase() === "U") {
        searchFloor = -1 // UG floor
      } else {
        searchFloor = parseInt(firstChar, 10)
      }
      if (!isNaN(searchFloor) && searchFloor >= -1 && searchFloor <= 4) {
        setCurrentFloor(searchFloor)
      }
    }
  }, [searchQuery, currentMode, setCurrentFloor])

  const onSelect = (value: string) => {
    // If in search mode and not locked, exit search mode and clear search
    if (currentMode === "search" && !isLocked) {
      setSearchQuery("")
      setSearchFocused(false)
      setCurrentMode("floors")
      // Clear room types and filter query when switching from search to floors
      setSelectedRoomTypes([])
      setFilterQuery("")
    } else if (currentMode === "none" || currentMode === "roomtype" || currentMode === "institution") {
      // Switch to floors mode, clearing any active room type or institution filter
      setCurrentMode("floors")
      setSelectedRoomTypes([])
      setFilterQuery("")
    }
    // If already in floors mode or filter mode, don't change the mode

    setCurrentFloor(parseInt(value))
  }

  const onCycle = () => {
    // If in search mode and not locked, exit search mode and clear search
    if (currentMode === "search" && !isLocked) {
      setSearchQuery("")
      setSearchFocused(false)
      setCurrentMode("floors")
      // Clear room types and filter query when switching from search to floors
      setSelectedRoomTypes([])
      setFilterQuery("")
    } else if (currentMode === "none" || currentMode === "roomtype" || currentMode === "institution") {
      // Switch to floors mode, clearing any active room type or institution filter
      setCurrentMode("floors")
      setSelectedRoomTypes([])
      setFilterQuery("")
    }

    // Only cycle through floors -1 to 3, excluding floor 4
    const order = FLOORS.filter((f) => f !== "4").map((f) => parseInt(f))
    const idx = order.indexOf(currentFloor)
    const nextIdx = idx === -1 ? 0 : (idx + 1) % order.length
    setCurrentFloor(order[nextIdx])
  }

  // Determine if a floor should be selected
  // When in search mode with all floors visible (no or short query), no radio button should be selected
  // When a room is selected, the radio button should match the floor of that room
  const isFloorSelected = (floor: number): boolean => {
    // If in search mode with all floors visible (searchQuery.length < 1), don't select any floor
    if (currentMode === "search" && searchQuery.length < 1) {
      return false
    }

    // In search mode with at least 1 character, extract floor from search query
    if (currentMode === "search" && searchQuery.length >= 1) {
      const firstChar = searchQuery.charAt(0)
      let searchFloor: number
      if (firstChar.toUpperCase() === "U") {
        searchFloor = -1 // UG floor
      } else {
        searchFloor = parseInt(firstChar, 10)
      }
      if (!isNaN(searchFloor) && searchFloor >= -1 && searchFloor <= 4) {
        return searchFloor === floor
      }
    }

    // In roomtype mode, if floor is 4 (roof), don't select any floor button (showing all floors)
    // Otherwise, select the current floor
    if (currentMode === "roomtype") {
      if (currentFloor === 4) {
        return false // No floor selected when showing all floors
      }
      return currentFloor === floor
    }

    // Otherwise, select the floor that matches currentFloor
    return currentFloor === floor
  }

  // Grey out floor filters only when in search mode (not when in floor mode with a room selected)
  const shouldGreyOut = currentMode === "search"

  // Check if a floor has rooms of the selected type
  const hasRoomsOnFloor = (floor: number): boolean => {
    if (selectedRoomTypes.length === 0) return false

    // Get all room IDs for the selected room types
    const roomIds: string[] = []
    selectedRoomTypes.forEach((roomType) => {
      roomIds.push(...getRoomNumbersForFilter(roomType))
    })

    // Check if any room IDs start with the floor number
    return roomIds.some((roomId) => roomId.startsWith(floor.toString()))
  }

  return (
    <div className="floor-container" aria-label="Floor filters">
      {FLOORS.slice()
        .reverse()
        .filter((floor) => floor !== "4")
        .map((floor) => (
          <FloorItem
            key={floor}
            floor={floor}
            isSelected={isFloorSelected(parseInt(floor))}
            groupId={groupId}
            onSelect={onSelect}
            mode={mode}
            greyedOut={shouldGreyOut}
            hasMarker={hasRoomsOnFloor(parseInt(floor))}
          />
        ))}
      <FloorCycleButton onCycle={onCycle} mode={mode} greyedOut={shouldGreyOut} />
    </div>
  )
}

export default FloorFilters
