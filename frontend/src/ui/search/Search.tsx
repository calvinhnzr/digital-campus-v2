import React, { useRef, useEffect } from "react"
import { useAtom } from "jotai"

import {
  searchRoomAtom,
  searchFocusedAtom,
  currentModeAtom,
  isSearchModeAtom,
  isRoomLockedAtom,
  selectedRoomTypesAtom,
  filterQueryAtom,
  currentFloorAtom,
  showFloorPlanAtom,
} from "@/store/atom"
import { FaSearch } from "react-icons/fa"

import "./Search.css"
import LockButton from "./LockButton"
import ShowFloorplanButton from "./ShowFloorplanButton"
import ShowAllFloorsButton from "./ShowAllFloorsButton"
import type { UIMode } from "@/ui/Layout"

interface SearchProps {
  mode?: UIMode
}

const Search: React.FC<SearchProps> = ({ mode = "default" }) => {
  const [currentMode, setCurrentMode] = useAtom(currentModeAtom)

  const [roomSearch, setRoomSearch] = useAtom(searchRoomAtom)
  const [, setSearchFocused] = useAtom(searchFocusedAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [isLocked] = useAtom(isRoomLockedAtom)
  const [selectedRoomTypes, setSelectedRoomTypes] = useAtom(selectedRoomTypesAtom)
  const [, setFilterQuery] = useAtom(filterQueryAtom)
  const [currentFloor, setCurrentFloor] = useAtom(currentFloorAtom)
  const [, setShowFloorPlan] = useAtom(showFloorPlanAtom)

  const mouseDownTimeRef = useRef<number>(0)
  const mouseDownPositionRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const leftButtonsRef = useRef<HTMLDivElement>(null)
  const rightButtonsRef = useRef<HTMLDivElement>(null)
  const lastMouseDownWasCanvasRef = useRef(false)

  const DRAG_THRESHOLD = 5 // pixels
  const CLICK_TIME_THRESHOLD = 200 // milliseconds

  const handleFocus = () => {
    setSearchFocused(true)
    setCurrentMode("search")
    setShowFloorPlan(false)
    // Clear room types and filter query when entering search mode
    setSelectedRoomTypes([])
    setFilterQuery("")
  }

  const handleBlur = () => {
    // Only refocus when leaving to rotate the 3D scene (canvas),
    // not when interacting with other UI like floor filters.
    if (currentMode === "search" && lastMouseDownWasCanvasRef.current) {
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true })
      }, 0)
    } else {
      // Clicking outside canvas (on other UI) — leave search mode
      setSearchFocused(false)
    }
  }
  // Keep the input focused when in search mode, but don't force atoms (avoids mode lock)
  useEffect(() => {
    if (currentMode === "search" && isSearchMode) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [isSearchMode, currentMode])

  // Move cursor to end when roomSearch changes (e.g., when clicking a room)
  useEffect(() => {
    if (roomSearch && inputRef.current) {
      const length = roomSearch.length
      // Use setTimeout to ensure the value is updated before setting cursor position
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(length, length)
        }
      }, 0)
    }
  }, [roomSearch])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      lastMouseDownWasCanvasRef.current = target.tagName === "CANVAS"
      // Ignore if clicking on the input itself or the buttons
      if (
        inputRef.current?.contains(e.target as Node) ||
        leftButtonsRef.current?.contains(e.target as Node) ||
        rightButtonsRef.current?.contains(e.target as Node)
      ) {
        return
      }

      // Don't track canvas clicks - let the 3D scene handle them
      if (target.tagName === "CANVAS") {
        return
      }

      mouseDownTimeRef.current = Date.now()
      mouseDownPositionRef.current = { x: e.clientX, y: e.clientY }
      isDraggingRef.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDownPositionRef.current) {
        const deltaX = Math.abs(e.clientX - mouseDownPositionRef.current.x)
        const deltaY = Math.abs(e.clientY - mouseDownPositionRef.current.y)

        // If mouse moved more than threshold, consider it a drag
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          isDraggingRef.current = true
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Ignore if clicking on the input itself or the buttons
      if (
        inputRef.current?.contains(e.target as Node) ||
        leftButtonsRef.current?.contains(e.target as Node) ||
        rightButtonsRef.current?.contains(e.target as Node)
      ) {
        mouseDownPositionRef.current = null
        return
      }

      // Don't handle canvas clicks here - the 3D scene's BackgroundPlane will handle them
      const target = e.target as HTMLElement
      if (target.tagName === "CANVAS") {
        mouseDownPositionRef.current = null
        isDraggingRef.current = false
        return
      }

      const mouseUpTime = Date.now()
      const timeDiff = mouseUpTime - mouseDownTimeRef.current

      // Only clear room selection if clicking outside canvas (on UI), room is selected, and not locked
      if (!isDraggingRef.current && timeDiff < CLICK_TIME_THRESHOLD && roomSearch.length >= 2 && !isLocked) {
        setRoomSearch("")
      }

      // Reset refs
      mouseDownPositionRef.current = null
      isDraggingRef.current = false
    }

    const handleMouseLeave = () => {
      // Reset refs on mouse leave
      mouseDownPositionRef.current = null
      isDraggingRef.current = false
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [roomSearch, setRoomSearch, isLocked])

  // Determine the mode text to display
  const getModeText = () => {
    if (currentMode === "search") {
      return "Room Search"
    }
    if (currentMode === "floors") {
      return "Floor Filter"
    }
    return ""
  }

  const modeText = getModeText()
  // Grey out search when in floor filter mode or roomtype mode
  const shouldGreyOutSearch = currentMode === "floors" || currentMode === "roomtype"

  const getDebugModeText = () => {
    const hasRoomType = selectedRoomTypes.length > 0
    const isFloorModeActive = currentMode === "floors" || (currentFloor !== 4 && currentMode !== "search")

    if (currentMode === "search") {
      return "search mode"
    }

    if (hasRoomType && isFloorModeActive) {
      return "roomtype + floor mode"
    }

    if (hasRoomType || currentMode === "roomtype") {
      return "roomtype mode"
    }

    if (isFloorModeActive) {
      return "floor mode"
    }

    return "none"
  }

  const handleExitSearch = () => {
    setRoomSearch("")
    setSearchFocused(false)
    setCurrentMode("none")
    setCurrentFloor(4)
    setSelectedRoomTypes([])
    setFilterQuery("")
    setShowFloorPlan(true)
    inputRef.current?.blur()
  }

  return (
    <>
      <div className="search-debug-info">
        <strong>Mode:</strong> {getDebugModeText()}
      </div>
      <div className="search-container">
        <div className="search-wrapper">
          {/* <ButtonGroup ref={leftButtonsRef}>
          <ShowFloorplanButton mode={mode} />
        </ButtonGroup> */}

          <span className="search-icon" aria-hidden="true">
            <FaSearch />
          </span>

          <input
            ref={inputRef}
            className={`ui-input search-input ${shouldGreyOutSearch ? "greyed-out" : ""}`}
            placeholder="e.g. 3216"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {currentMode === "search" && (
            <button className="search-clear-btn" onClick={handleExitSearch} aria-label="Exit search">
              ✕
            </button>
          )}
          {/* <ButtonGroup ref={rightButtonsRef}>
          <ShowAllFloorsButton mode={mode} />
          <LockButton mode={mode} />
        </ButtonGroup> */}
        </div>
        {/* <div className={`search-mode-label ${modeText ? 'visible' : ''}`}>
        {modeText}
      </div> */}
        {/* {roomSearch && `Searching for: ${roomSearch}`} */}
      </div>
    </>
  )
}

export default Search
