import React, { useEffect } from "react"
import { useAtom } from "jotai"
import { isRoomLockedAtom, searchRoomAtom, showAllFloorsInSearchAtom } from "@/store/atom"
import { ToggleButton } from "./ToggleButtons.styles"
import type { UIMode } from "@/ui/Layout"

interface LockButtonProps {
  mode?: UIMode
}

const LockButton: React.FC<LockButtonProps> = ({ mode = "default" }) => {
  const [isLocked, setIsLocked] = useAtom(isRoomLockedAtom)
  const [searchRoom] = useAtom(searchRoomAtom)
  const [showAllFloorsInSearch] = useAtom(showAllFloorsInSearchAtom)

  // Auto-unlock when room is cleared (goes below minimum length)
  // BUT don't auto-unlock if "Show All Floors in Search" is active
  useEffect(() => {
    if (searchRoom.length < 2 && isLocked && !showAllFloorsInSearch) {
      setIsLocked(false)
    }
  }, [searchRoom, isLocked, setIsLocked, showAllFloorsInSearch])

  const handleToggle = () => {
    setIsLocked((prev) => !prev)
  }

  // Disable button when no room is selected, unless "Show All Floors" is active
  const isDisabled = searchRoom.length < 2 && !showAllFloorsInSearch

  return (
    <ToggleButton
      onClick={handleToggle}
      $active={isLocked}
      $mode={mode}
      title={isLocked ? "Unlock room selection" : "Lock room selection"}
      disabled={isDisabled}
      style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}
    >
      {isLocked ? (
        // Locked icon
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        // Unlocked icon
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      )}
    </ToggleButton>
  )
}

export default LockButton
