import { useAtom } from "jotai"
import { useEffect } from "react"
import { useControls } from "leva"

import Filter from "@/ui/filter/Filter"
import FloorFilters from "@/ui/floor/FloorFilters"
import Search from "@/ui/search/Search"
import RoomDataSidebar from "@/ui/sidebar/RoomDataSidebar"
import POIDataSidebar from "@/ui/sidebar/POIDataSidebar"

import "@/ui/styles/ui-base.css"

import {
  currentModeAtom,
  isSearchModeAtom,
  currentFloorAtom,
  searchRoomAtom,
  showAllFloorsInSearchAtom,
  isRoomLockedAtom,
  uiBaseColorAtom,
  showAllPOIsAtom,
} from "@/store/atom"

export type UIMode = "default" | "glass" | "flat"

// const defaultBaseColor = "#c96c3d"
// const defaultBaseColor = "#837777"
const defaultBaseColor = "#888888"
const defaultBadgeColor = "coral"

interface LayoutProps {
  /** Base color for UI elements in oklch format, e.g. "oklch(50% 0.12 50)" */
  baseColor?: string
  /** Badge/indicator dot color */
  badgeColor?: string
  /** UI display mode */
  mode?: UIMode
}

export const Layout = ({
  baseColor = defaultBaseColor,
  badgeColor = defaultBadgeColor,
  mode: initialMode = "flat",
}: LayoutProps) => {
  const [, setUiBaseColor] = useAtom(uiBaseColorAtom)

  const { uiBaseColor, uiBadgeColor, uiMode } = useControls(
    "UI Theme",
    {
      uiBaseColor: { value: baseColor, label: "Base Color" },
      uiBadgeColor: { value: badgeColor, label: "Badge Color" },
      uiMode: { value: initialMode, options: ["default", "glass", "flat"] as UIMode[], label: "Mode" },
    },
    { collapsed: true }
  )

  // Sync base color to atom so 3D overlays can access it
  useEffect(() => {
    if (uiBaseColor) setUiBaseColor(uiBaseColor)
  }, [uiBaseColor, setUiBaseColor])

  const [currentMode, setCurrentMode] = useAtom(currentModeAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [searchRoom] = useAtom(searchRoomAtom)
  const [, setCurrentFloor] = useAtom(currentFloorAtom)
  const [showAllFloorsInSearch] = useAtom(showAllFloorsInSearchAtom)
  const [, setIsRoomLocked] = useAtom(isRoomLockedAtom)
  const [showAllPOIs, setShowAllPOIs] = useAtom(showAllPOIsAtom)

  // Effect to set floor to 4 (roof) when search mode is activated and showing all floors
  // This happens when user focuses search input or types but hasn't selected a specific room yet
  useEffect(() => {
    if (currentMode === "search" && isSearchMode && searchRoom.length < 2) {
      // In search mode but no specific room selected = showing all floors, set to roof
      setCurrentFloor(4)
    }
  }, [currentMode, isSearchMode, searchRoom, setCurrentFloor])

  // Effect to automatically activate lock when "show all floors in search" is enabled
  useEffect(() => {
    if (showAllFloorsInSearch) {
      setIsRoomLocked(true)
    }
  }, [showAllFloorsInSearch, setIsRoomLocked])

  // Build CSS class name for current mode
  const modeClass = `ui-mode-${uiMode}`

  // Custom style for base color and badge color override
  const customStyle: React.CSSProperties = {
    ...(uiBaseColor && { "--ui-base": uiBaseColor }),
    ...(uiBadgeColor && { "--ui-badge-bg": uiBadgeColor }),
  } as React.CSSProperties

  return (
    <div className={modeClass} style={customStyle}>
      {/* <div style={styles}>{currentMode}</div> */}
      <Search mode={uiMode} />
      <FloorFilters mode={uiMode} />
      <Filter mode={uiMode} />
      {/* <RoomDataSidebar /> */}
      {/* <POIDataSidebar /> */}

      {/* Temporary button to show all POIs */}
      <button
        onClick={() => {
          const newState = !showAllPOIs
          setShowAllPOIs(newState)
          // When showing POIs, switch to roof view (floor 4) to see all floors
          if (newState) {
            setCurrentFloor(4)
          }
        }}
        style={{
          position: "fixed",
          top: "10px",
          display: "none",
          right: "10px",
          padding: "10px 20px",
          backgroundColor: showAllPOIs ? "#2ecc71" : "#888888",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
          fontWeight: "bold",
        }}
      >
        {showAllPOIs ? "Hide POIs" : "Show All POIs"}
      </button>
    </div>
  )
}
