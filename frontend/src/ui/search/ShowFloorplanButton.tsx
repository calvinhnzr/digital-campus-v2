import React from "react"
import { useAtom } from "jotai"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { showFloorPlanAtom } from "@/store/atom"
import { ToggleButton } from "./ToggleButtons.styles.ts"
import type { UIMode } from "@/ui/Layout"

interface ShowFloorplanButtonProps {
  mode?: UIMode
}

const ShowFloorplanButton: React.FC<ShowFloorplanButtonProps> = ({ mode = "default" }) => {
  const [showFloorPlan, setShowFloorPlan] = useAtom(showFloorPlanAtom)

  const handleToggle = () => {
    setShowFloorPlan((prev) => !prev)
  }

  return (
    <ToggleButton onClick={handleToggle} $active={showFloorPlan} $mode={mode} title="Toggle Floorplan">
      {showFloorPlan ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
    </ToggleButton>
  )
}

export default ShowFloorplanButton
