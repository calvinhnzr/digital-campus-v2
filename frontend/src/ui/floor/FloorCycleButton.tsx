import React from "react"
import { FaLayerGroup } from "react-icons/fa"
import "./FloorFilters.css"
import type { UIMode } from "@/ui/Layout"

type FloorCycleButtonProps = {
  onCycle: () => void
  mode?: UIMode
  greyedOut?: boolean
}

export const FloorCycleButton: React.FC<FloorCycleButtonProps> = ({ onCycle, mode = "default", greyedOut = false }) => {
  const itemClasses = ["ui-floor-item", greyedOut ? "greyed-out" : ""].filter(Boolean).join(" ")

  return (
    <li
      className={itemClasses}
      onClick={onCycle}
      title={greyedOut ? "Click to switch to floor filter mode" : "Click to cycle floors"}
    >
      <span className="ui-item-label">
        <FaLayerGroup />
      </span>
    </li>
  )
}
