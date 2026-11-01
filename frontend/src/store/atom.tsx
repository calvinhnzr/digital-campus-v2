import { atom } from "jotai"

export const searchRoomAtom = atom("")

export const filterQueryAtom = atom("")

export const enableXRayAtom = atom(false)

export const currentFloorAtom = atom(4)

// Atom to track if room selection is locked (prevents deselection on click)
export const isRoomLockedAtom = atom(false)

// Atom to track if search input is focused
export const searchFocusedAtom = atom(false)

// Derived atom to check if we're in search mode (user is typing in search or search is focused)
export const isSearchModeAtom = atom((get) => {
  const searchQuery = get(searchRoomAtom)
  const searchFocused = get(searchFocusedAtom)
  return searchQuery.length > 0 || searchFocused
})

// Atom to store selected room types (e.g., "lecture", "lab", "seminar")
export const selectedRoomTypesAtom = atom<string[]>([])

// Atom to store selected institution ID for highlighting
export const selectedInstitutionAtom = atom<string>("")

// enum
export type enumModes = "search" | "filter" | "floors" | "roomtype" | "institution" | "none"

export const currentModeAtom = atom<enumModes>("none")

// Atom to control floorplan visibility (inverted: false = visible, true = hidden)
export const showFloorPlanAtom = atom(false)

// Atom to control showing all floors in search mode
export const showAllFloorsInSearchAtom = atom(false)

// Atom to control room data sidebar visibility
export const roomDataSidebarOpenAtom = atom(false)

// Atom to store selected room numbers for the sidebar form
export const selectedRoomNumbersAtom = atom<string[]>([])

// Atom to share UI base color with 3D overlays (set from Layout)
export const uiBaseColorAtom = atom("#888888")

// Atom to control POI data sidebar visibility
export const poiDataSidebarOpenAtom = atom(false)

// Atom to store selected POI ID for the sidebar form
export const selectedPoiIdAtom = atom<string>("")

// Atom to control showing all POIs
export const showAllPOIsAtom = atom(false)
