import { useCallback, useMemo, useRef } from "react"
import { useAtom } from "jotai"

import {
  searchRoomAtom,
  currentFloorAtom,
  isSearchModeAtom,
  isRoomLockedAtom,
  showAllFloorsInSearchAtom,
  currentModeAtom,
  filterQueryAtom,
  searchFocusedAtom,
  selectedRoomNumbersAtom,
  roomDataSidebarOpenAtom,
} from "@/store/atom"

type RoomClickParams = {
  roomKey: string
  floorNumber: number
  isVisible?: boolean
}

/**
 * Hook to handle room and background click events across different modes (search, floor filter).
 *
 * Provides consistent click behavior:
 * - In search mode with short/empty query or "Show All Floors" enabled: allows clicking any floor
 * - Otherwise: restricts clicks to the current floor
 * - Room clicks set searchRoomAtom and switch to search mode
 * - Background clicks clear selection (respects lock status)
 * - Click detection uses time and distance thresholds to distinguish clicks from camera drags
 *
 * @example
 * ```tsx
 * const { makeRoomOnClick, handleBackgroundClick, handleBackgroundPointerDown } = useClickHandler()
 *
 * // For room meshes/instances:
 * <Instance onClick={makeRoomOnClick({ roomKey: "3216", floorNumber: 3, isVisible: true })} />
 *
 * // For background plane:
 * <mesh onPointerDown={handleBackgroundPointerDown} onClick={handleBackgroundClick} />
 * ```
 *
 * @returns Object containing click handlers and guard functions
 */
export const useClickHandler = () => {
  const [searchQuery, setSearchQuery] = useAtom(searchRoomAtom)
  const [, setCurrentFloor] = useAtom(currentFloorAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [isLocked] = useAtom(isRoomLockedAtom)
  const [showAllFloorsInSearch] = useAtom(showAllFloorsInSearchAtom)
  const [currentMode, setCurrentMode] = useAtom(currentModeAtom)
  const [, setFilterQuery] = useAtom(filterQueryAtom)
  const [, setSearchFocused] = useAtom(searchFocusedAtom)
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useAtom(selectedRoomNumbersAtom)
  const [isSidebarOpen] = useAtom(roomDataSidebarOpenAtom)
  const currentFloor = useAtom(currentFloorAtom)[0]

  // Track mouse down time to distinguish clicks from drags
  const mouseDownTimeRef = useRef<number>(0)
  const mouseDownPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Constants for click detection
  const CLICK_TIME_THRESHOLD = 200 // ms - max time for a click
  const CLICK_DISTANCE_THRESHOLD = 5 // pixels - max movement for a click

  const isSearchModeWithAllFloors = useMemo(() => {
    return isSearchMode && (searchQuery.length < 1 || showAllFloorsInSearch)
  }, [isSearchMode, searchQuery.length, showAllFloorsInSearch])

  // When search query starts with a non-digit (and not "U" for UG), floor can't be inferred — allow any floor
  const isNonNumericSearch = useMemo(() => {
    if (!isSearchMode || searchQuery.length < 1) return false
    const firstChar = searchQuery.charAt(0)
    // "U" is valid (UG floor), so only treat as non-numeric if it's neither a digit nor "U"
    return firstChar.toUpperCase() !== "U" && isNaN(parseInt(firstChar, 10))
  }, [isSearchMode, searchQuery])

  const shouldAllowRoomClick = useCallback(
    (floorNumber: number, extraVisible?: boolean) => {
      if (extraVisible === false) return false
      // In roomtype mode, allow clicking any floor (same as search mode with all floors)
      if (currentMode === "roomtype") return true
      // In search mode with all floors visible OR when explicit setting is on, allow clicking any floor
      if (isSearchModeWithAllFloors) return true
      // If search query starts with a letter, allow clicking any floor
      if (isNonNumericSearch) return true
      // Otherwise, restrict to current floor
      return currentFloor === floorNumber
    },
    [currentFloor, isSearchModeWithAllFloors, currentMode, isNonNumericSearch]
  )

  const handleRoomClick = useCallback(
    (params: RoomClickParams, e?: any) => {
      const { roomKey, floorNumber, isVisible } = params
      if (!shouldAllowRoomClick(floorNumber, isVisible)) return

      // Check if the click is over a UI overlay (sidebar, etc.)
      // R3F events have clientX/clientY from the original DOM event
      if (e?.clientX !== undefined && e?.clientY !== undefined) {
        const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY)
        const isOverUI = elementsAtPoint.some(
          (el) =>
            el.closest(".room-data-sidebar") ||
            el.closest(".sidebar-toggle") ||
            el.closest(".ui-list") ||
            el.closest(".filter-wrapper")
        )
        if (isOverUI) {
          return
        }
      }

      // Prevent background handlers
      if (e?.stopPropagation) e.stopPropagation()

      // Selecting a room: update the search query
      setSearchQuery(String(roomKey))
      // Update the current floor to match the clicked room's floor
      // BUT don't update floor in roomtype/institution mode to keep all floors visible
      if (currentMode !== "roomtype" && currentMode !== "institution") {
        setCurrentFloor(floorNumber)
      }
      // Don't disable floor/roomtype/institution filter when we're explicitly in that mode
      if (currentMode !== "floors" && currentMode !== "roomtype" && currentMode !== "institution") {
        setCurrentMode("search")
      }

      // If sidebar is open, add the room number to the selected room numbers
      if (isSidebarOpen) {
        setSelectedRoomNumbers((prev) => {
          // Check if room number already exists to avoid duplicates
          if (prev.includes(String(roomKey))) {
            return prev
          }
          return [...prev, String(roomKey)]
        })
      }
    },
    [setSearchQuery, setCurrentMode, shouldAllowRoomClick, currentMode, isSidebarOpen, setSelectedRoomNumbers]
  )

  const makeRoomOnClick = useCallback(
    (params: RoomClickParams) => (e: any) => {
      handleRoomClick(params, e)
    },
    [handleRoomClick]
  )

  const handleBackgroundClick = useCallback(
    (e?: any) => {
      // Clear room/filter selection when clicking background (respects lock status)
      // Stays in the current mode (search/floors/filter)
      if (e?.stopPropagation) e.stopPropagation()

      // Check if this is a quick click (not a drag/rotation)
      const currentTime = Date.now()
      const timeDiff = currentTime - mouseDownTimeRef.current

      // Calculate distance moved (if position info available)
      let distanceMoved = 0
      if (e?.clientX !== undefined && e?.clientY !== undefined) {
        const dx = e.clientX - mouseDownPositionRef.current.x
        const dy = e.clientY - mouseDownPositionRef.current.y
        distanceMoved = Math.sqrt(dx * dx + dy * dy)
      }

      // Only clear selection if it's a quick click with minimal movement
      const isQuickClick = timeDiff < CLICK_TIME_THRESHOLD && distanceMoved < CLICK_DISTANCE_THRESHOLD

      if (!isQuickClick) {
        return // Don't clear selection during camera rotation/drag
      }

      // In roomtype/institution mode, just clear the search query to show all matching rooms again
      if (currentMode === "roomtype" || currentMode === "institution") {
        setSearchQuery("")
        return
      }

      // If "Show All Floors in Search" is enabled, ALWAYS allow clearing selection
      // (bypass lock so users can quickly reset while browsing all floors)
      if (showAllFloorsInSearch) {
        setSearchQuery("")
        return
      }

      // Otherwise, respect the lock state: only clear when not locked
      if (!isLocked) {
        setSearchQuery("")
      }
      // Don't change currentMode - stay in the current mode
      // Don't change currentFloor - keep the current floor view
      // Don't change searchFocused - keep the focus state
    },
    [isLocked, showAllFloorsInSearch, setSearchQuery, setFilterQuery, currentMode, currentFloor, setCurrentFloor]
  )

  const handleBackgroundPointerDown = useCallback((e?: any) => {
    mouseDownTimeRef.current = Date.now()
    if (e?.clientX !== undefined && e?.clientY !== undefined) {
      mouseDownPositionRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  return {
    // guards
    shouldAllowRoomClick,
    // handlers
    handleRoomClick,
    /** Creates an onClick handler for room meshes/instances */
    makeRoomOnClick,
    /** Handler for background clicks to clear room selection */
    handleBackgroundClick,
    /** Handler to track pointer down for click detection */
    handleBackgroundPointerDown,
  }
}

export default useClickHandler
