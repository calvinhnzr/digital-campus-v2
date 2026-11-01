import React, { useState, useEffect, useRef } from "react"
import { FilterItem, FilterCategory, HoveredState } from "@/types/filter"
import "./FilterItem.css"
import type { UIMode } from "@/ui/Layout"

import { capitalizeFirstLetter } from "@/utils/helpers/textTransform"

// Helper function to generate unique ID for a subitem
const getSubItemId = (parentLabel: string, subLabel: string, subId?: string): string => {
  return subId || `${parentLabel}:${subLabel}`
}

interface FilterItemComponentProps {
  filter: FilterItem
  idx: number
  category: FilterCategory
  radioName: string
  hoveredIdx: HoveredState | null
  filterQuery: string
  showLabel?: boolean
  mode?: UIMode
  onMouseEnter: (category: FilterCategory, idx: number) => void
  onMouseLeave: () => void
  onRadioChange: (value: string, category?: FilterCategory) => void
}

export const FilterItemComponent: React.FC<FilterItemComponentProps> = ({
  filter,
  idx,
  category,
  radioName,
  hoveredIdx,
  filterQuery,
  showLabel = false,
  mode = "default",
  onMouseEnter,
  onMouseLeave,
  onRadioChange,
}) => {
  const isActive = hoveredIdx?.list === category && hoveredIdx?.idx === idx
  const hasSubItems = filter.subItems && filter.subItems.length > 0
  const isEmptySubItems = filter.subItems && filter.subItems.length === 0

  // Track which subitem is currently hovered
  const [hoveredSubIdx, setHoveredSubIdx] = useState<number | null>(null)
  const [subItemPositions, setSubItemPositions] = useState<number[]>([])
  const [shouldTransition, setShouldTransition] = useState<boolean>(true)
  const subListRef = useRef<HTMLUListElement>(null)
  const prevHoveredIdx = useRef<HoveredState | null>(null)
  const prevIsActive = useRef<boolean>(false)

  // Find the selected subitem index using unique ID comparison
  const selectedSubIdx = hasSubItems
    ? filter.subItems.findIndex((sub) => filterQuery === getSubItemId(filter.label, sub.label, sub.id))
    : -1

  // Determine which subitem should show the label (hovered or selected)
  const activeSubIdx = hoveredSubIdx !== null ? hoveredSubIdx : selectedSubIdx

  // Reset hovered state when parent item becomes active/inactive
  useEffect(() => {
    if (isActive && !prevIsActive.current) {
      // Parent item just became active - reset hovered state
      setHoveredSubIdx(null)
    } else if (!isActive && prevIsActive.current) {
      // Parent item just became inactive - clear hovered state
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

  // Calculate positions for all subitems
  useEffect(() => {
    if (isActive && subListRef.current && hasSubItems) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        if (!subListRef.current) return

        const subItems = Array.from(subListRef.current.children).filter(
          (child) => child.tagName === "LI"
        ) as HTMLElement[]

        const positions = subItems.map((subItem) => {
          const subItemOffsetLeft = subItem.offsetLeft
          const subItemWidth = subItem.offsetWidth
          return subItemOffsetLeft + subItemWidth / 2
        })

        setSubItemPositions(positions)
      })
    }
  }, [isActive, hasSubItems, filter.subItems.length])

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
    } else if (isEmptySubItems) {
      // For items with no subitems (like room filters), directly select them
      onRadioChange(filter.label, category)
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
      onClick={hasSubItems || isEmptySubItems ? handleItemClick : undefined}
      style={{ cursor: hasSubItems || isEmptySubItems ? "pointer" : "default" }}
    >
      <span className="ui-item-label">{filter.icon || filter.label}</span>

      {/* Show selected subitem label above parent item when sublist is closed and no item is hovered */}
      {hasSubItems && !isActive && selectedSubIdx >= 0 && (
        <div className={`filter-item-selected-label ${labelVisibility ? "visible" : "hidden"}`}>
          {filter.subItems[selectedSubIdx]?.label}
          <div className="filter-item-label-tail" />
        </div>
      )}

      {/* Show label above item for items with no subitems when selected or hovered */}
      {isEmptySubItems && (isActive || filterQuery === filter.label) && (
        <div className="filter-item-selected-label visible">
          {capitalizeFirstLetter(filter.label)}
          <div className="filter-item-label-tail" />
        </div>
      )}

      {isEmptySubItems && (
        <label>
          <input
            type="radio"
            name={radioName}
            value={filter.label}
            checked={filterQuery === filter.label}
            onChange={() => onRadioChange(filter.label, category)}
          />
        </label>
      )}

      {hasSubItems && (
        <ul
          ref={subListRef}
          className={`ui-sub-list ${isActive ? "visible" : ""} ${filter.subItems.length <= 2 ? "centered" : ""}`}
          style={{ transition: shouldTransition ? undefined : "none" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Parent item label at the bottom of the SubList */}
          <div className="filter-sublist-parent-label">{capitalizeFirstLetter(filter.label)}</div>

          {/* Individual labels for each subitem */}
          {filter.subItems.map((sub, subIdx) => {
            const isActiveLabel = activeSubIdx >= 0 && subIdx === activeSubIdx
            const targetPosition = activeSubIdx >= 0 ? subItemPositions[activeSubIdx] : subItemPositions[subIdx]

            return (
              <div
                key={`label-${subIdx}`}
                className="filter-subitem-label"
                style={{
                  left: `${targetPosition || 0}px`,
                  opacity: isActiveLabel ? 1 : 0,
                  pointerEvents: "none",
                }}
              >
                {capitalizeFirstLetter(sub.label)}
              </div>
            )
          })}

          {filter.subItems.map((sub, subIdx) => {
            const subItemId = getSubItemId(filter.label, sub.label, sub.id)
            const selected = filterQuery === subItemId
            return (
              <li
                key={subIdx}
                className={`ui-sub-item ${selected ? "checked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onRadioChange(subItemId, category)
                }}
                onMouseEnter={() => setHoveredSubIdx(subIdx)}
                onMouseLeave={() => setHoveredSubIdx(null)}
                aria-selected={selected}
                style={{ cursor: "pointer" }}
              >
                <span className="ui-item-label">{sub.icon || capitalizeFirstLetter(sub.label)}</span>

                <label>
                  <input
                    type="radio"
                    name={radioName}
                    value={subItemId}
                    checked={selected}
                    onChange={() => onRadioChange(subItemId, category)}
                  />
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
