import React from "react"
import { useAtom } from "jotai"
import { showAllFloorsInSearchAtom } from "@/store/atom"
import { ToggleButton } from "./ToggleButtons.styles.ts"
import type { UIMode } from "@/ui/Layout"

interface ShowAllFloorsButtonProps {
  mode?: UIMode
}

const ShowAllFloorsButton: React.FC<ShowAllFloorsButtonProps> = ({ mode = "default" }) => {
  const [showAllFloors, setShowAllFloors] = useAtom(showAllFloorsInSearchAtom)

  const handleToggle = () => {
    setShowAllFloors((prev) => !prev)
  }

  return (
    <ToggleButton onClick={handleToggle} $active={showAllFloors} $mode={mode} title="Show All Floors in Search">
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
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
      </svg>
    </ToggleButton>
  )
}

export default ShowAllFloorsButton
