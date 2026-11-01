import React from "react"
import "./FloorFilters.css"
import type { UIMode } from "@/ui/Layout"

type FloorItemProps = {
  floor: string
  isSelected: boolean
  groupId: string
  onSelect: (value: string) => void
  mode?: UIMode
  greyedOut?: boolean
  hasMarker?: boolean
}

export const FloorItem: React.FC<FloorItemProps> = ({
  floor,
  isSelected,
  groupId,
  onSelect,
  mode = "default",
  greyedOut = false,
  hasMarker = false,
}) => {
  const itemClasses = ["ui-floor-item", greyedOut ? "greyed-out" : ""].filter(Boolean).join(" ")

  // Display "UG" for basement floor (-1) instead of "-1"
  const displayLabel = floor === "-1" ? "UG" : floor

  return (
    <li className={itemClasses}>
      <label>
        <input
          type="radio"
          name={`floors-${groupId}`}
          value={floor}
          checked={isSelected}
          onChange={() => onSelect(floor)}
        />
        <span className="ui-item-label floor-item-label">{displayLabel}</span>
        {hasMarker && <span className="ui-marker" />}
      </label>
    </li>
  )
}
