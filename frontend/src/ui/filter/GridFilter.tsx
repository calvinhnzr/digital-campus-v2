import React, { useState, useEffect, useRef } from "react"
import { FilterItem, FilterCategory, HoveredState } from "@/types/filter"
import type { UIMode } from "@/ui/Layout"
import "./GridFilter.css"
import "./FilterItem.css"

// Helper function to generate unique ID for a subitem
const getSubItemId = (parentLabel: string, subLabel: string, subId?: string): string => {
  return subId || `${parentLabel}:${subLabel}`
}

interface GridFilterProps {
  filter: FilterItem
  idx: number
  category: FilterCategory
  radioName: string
  hoveredIdx: HoveredState | null
  filterQuery: string
  mode?: UIMode
  onMouseEnter: (category: FilterCategory, idx: number) => void
  onMouseLeave: () => void
  onRadioChange: (value: string, category?: FilterCategory) => void
}

export const GridFilter: React.FC<GridFilterProps> = ({
  filter,
  idx,
  category,
  radioName,
  hoveredIdx,
  filterQuery,
  mode = "default",
  onMouseEnter,
  onMouseLeave,
  onRadioChange,
}) => {
  const isActive = hoveredIdx?.list === category && hoveredIdx?.idx === idx
  const hasSubItems = filter.subItems && filter.subItems.length > 0

  const [hoveredSubIdx, setHoveredSubIdx] = useState<number | null>(null)
  const [shouldTransition, setShouldTransition] = useState<boolean>(true)
  const prevHoveredIdx = useRef<HoveredState | null>(null)
  const prevIsActive = useRef<boolean>(false)

  // Find the selected subitem index using unique ID comparison
  const selectedSubIdx = hasSubItems
    ? filter.subItems.findIndex((sub) => filterQuery === getSubItemId(filter.label, sub.label, sub.id))
    : -1

  // Reset hovered state when parent item becomes active/inactive
  useEffect(() => {
    if (isActive && !prevIsActive.current) {
      setHoveredSubIdx(null)
    } else if (!isActive && prevIsActive.current) {
      setHoveredSubIdx(null)
    }
    prevIsActive.current = isActive
  }, [isActive])

  // Detect if we're switching between different parent items
  useEffect(() => {
    const wasActive = prevHoveredIdx.current?.list === category && prevHoveredIdx.current?.idx === idx
    const nowActive = isActive
    const bothHaveValues = prevHoveredIdx.current !== null && hoveredIdx !== null
    const differentItems =
      prevHoveredIdx.current?.list !== hoveredIdx?.list || prevHoveredIdx.current?.idx !== hoveredIdx?.idx

    // Skip transition when switching directly between different parent items
    if (wasActive && !nowActive && bothHaveValues && differentItems) {
      setShouldTransition(false)
    } else {
      setShouldTransition(true)
    }

    prevHoveredIdx.current = hoveredIdx
  }, [hoveredIdx, isActive, category, idx])

  const handleItemClick = () => {
    if (hasSubItems) {
      // Find current selected subitem index using unique ID
      const currentIndex = filter.subItems.findIndex(
        (sub) => filterQuery === getSubItemId(filter.label, sub.label, sub.id)
      )

      // If no subitem is selected or we're at the last item, select the first one
      // Otherwise, select the next item
      const nextIndex = currentIndex === -1 || currentIndex === filter.subItems.length - 1 ? 0 : currentIndex + 1

      onRadioChange(
        getSubItemId(filter.label, filter.subItems[nextIndex].label, filter.subItems[nextIndex].id),
        category
      )
    }
  }

  // Add has-selection class when a child is already selected (to prevent scale-up)
  const itemClasses = ["ui-item", isActive ? "active" : "", selectedSubIdx >= 0 ? "has-selection" : ""]
    .filter(Boolean)
    .join(" ")

  const labelVisibility = hoveredIdx === null || hoveredIdx.list === "toggle" || hoveredIdx.list === "clear"

  return (
    <li
      key={filter.label}
      className={itemClasses}
      onMouseEnter={() => onMouseEnter(category, idx)}
      onMouseLeave={onMouseLeave}
      onClick={hasSubItems ? handleItemClick : undefined}
      style={{ cursor: hasSubItems ? "pointer" : "default" }}
    >
      <span className="ui-item-label">{filter.icon || filter.label}</span>

      {/* Show selected subitem label above parent item when sublist is closed and no item is hovered */}
      {hasSubItems && !isActive && selectedSubIdx >= 0 && (
        <div className={`filter-item-selected-label ${labelVisibility ? "visible" : "hidden"}`}>
          {filter.subItems[selectedSubIdx]?.longLabel || filter.subItems[selectedSubIdx]?.label}
          <div className="filter-item-label-tail" />
        </div>
      )}

      {hasSubItems && (
        <div
          className={`ui-accessibility-grid ${isActive ? "visible" : ""} ${!shouldTransition ? "no-transition" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Parent item label at the top of the Grid */}
          <div className="ui-grid-parent-label">{filter.label}</div>

          {filter.subItems.map((sub, subIdx) => {
            const subItemId = getSubItemId(filter.label, sub.label, sub.id)
            const selected = filterQuery === subItemId
            const isHovered = hoveredSubIdx === subIdx

            return (
              <div key={subIdx} className="ui-grid-item-wrapper">
                <div
                  className={`ui-grid-sub-item ${selected ? "selected" : ""} ${isHovered ? "hovered" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRadioChange(subItemId, category)
                  }}
                  onMouseEnter={() => setHoveredSubIdx(subIdx)}
                  onMouseLeave={() => setHoveredSubIdx(null)}
                  aria-selected={selected}
                  style={{ cursor: "pointer" }}
                >
                  <span className="ui-item-label">{sub.icon || sub.label}</span>

                  <label>
                    <input
                      type="radio"
                      name={radioName}
                      value={subItemId}
                      checked={selected}
                      onChange={() => onRadioChange(subItemId, category)}
                    />
                  </label>
                </div>

                <span className="ui-grid-item-label">{sub.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </li>
  )
}
