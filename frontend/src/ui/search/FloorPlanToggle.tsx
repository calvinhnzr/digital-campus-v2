import React from "react"
import { useAtom } from "jotai"
import { showFloorPlanAtom } from "@/store/atom"
import { ToggleButton } from "./FloorPlanToggle.styles"
import type { UIMode } from "@/ui/Layout"

interface FloorPlanToggleProps {
  mode?: UIMode
}

const FloorPlanToggle: React.FC<FloorPlanToggleProps> = ({ mode = "default" }) => {
  const [showFloorPlan, setShowFloorPlan] = useAtom(showFloorPlanAtom)

  const handleToggle = () => {
    setShowFloorPlan((prev) => !prev)
  }

  return (
    <ToggleButton onClick={handleToggle} $active={showFloorPlan} $mode={mode} title="Toggle Floor Plan">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    </ToggleButton>
  )
}

export default FloorPlanToggle
