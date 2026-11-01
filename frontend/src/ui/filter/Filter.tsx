import React, { useState } from "react"
import { useAtom } from "jotai"
import { useControls } from "leva"

import {
  filterQueryAtom,
  searchRoomAtom,
  currentModeAtom,
  currentFloorAtom,
  searchFocusedAtom,
  selectedRoomTypesAtom,
  selectedInstitutionAtom,
  showFloorPlanAtom,
} from "@/store/atom"
import {
  areaFilters,
  weeklyEventFilters,
  roomFilters,
  accessibilityFilters,
  specialEventFilters,
  livingFilters,
  institutionFilters,
} from "@/data/filters"
import { useFilterHover } from "@/hooks/useFilterHover"
import { useFilterToggle } from "@/hooks/useFilterToggle"

import { FilterItemComponent } from "./FilterItem"
import { GridFilter } from "./GridFilter"
import "./Filter.css"

import type { UIMode } from "@/ui/Layout"

const sizeItem = "3.7rem"

interface FilterProps {
  mode?: UIMode
}

const Filter: React.FC<FilterProps> = ({ mode = "default" }) => {
  const [currentMode, setCurrentMode] = useAtom(currentModeAtom)
  const [filterQuery, setFilterQuery] = useAtom(filterQueryAtom)
  const [currentFloor, setCurrentFloor] = useAtom(currentFloorAtom)

  const [searchRoom, setSearchRoom] = useAtom(searchRoomAtom)
  const [searchFocused, setSearchFocused] = useAtom(searchFocusedAtom)
  const [selectedRoomTypes, setSelectedRoomTypes] = useAtom(selectedRoomTypesAtom)
  const [selectedInstitution, setSelectedInstitution] = useAtom(selectedInstitutionAtom)
  const [, setShowFloorPlan] = useAtom(showFloorPlanAtom)

  const { showRooms, filterScale, isAnimating, handleToggle } = useFilterToggle()
  const { hoveredIdx, handleMouseEnter, handleMouseLeave } = useFilterHover(isAnimating)

  const handleRadioChange = (value: string, category?: string) => {
    // Ensure floorplan is visible when any filter is actively applied
    setShowFloorPlan(false)
    setFilterQuery(value)

    // If clicking on a room filter, subtype filter, elevation filter, or POI filter, activate roomtype mode
    if (
      category === "room" ||
      value.startsWith("subtype:") ||
      value === "elevation:stairs" ||
      value === "elevation:lift" ||
      value.startsWith("poi:")
    ) {
      setCurrentMode("roomtype")

      // For POI filters, always switch to roof view (floor 4) to see all floors
      if (value.startsWith("poi:")) {
        setCurrentFloor(4)
      }

      setSearchRoom("") // Clear any search
      setSearchFocused(false)

      // Only show one room type at a time (replace, not toggle)
      setSelectedRoomTypes([value])
      setSelectedInstitution("") // Clear institution
    } else if (category === "institution" || value.startsWith("institution:")) {
      // Institution filter selected
      setCurrentMode("institution")
      setSearchRoom("")
      setSearchFocused(false)
      setSelectedRoomTypes([]) // Clear room types
      setSelectedInstitution(value.slice("institution:".length)) // Extract institution ID
    } else {
      // If clicking on non-room filters (area, accessibility, etc.), clear room types and institutions
      setSelectedRoomTypes([])
      setSelectedInstitution("")
    }
  }

  const clearFilter = () => {
    setFilterQuery("")
    setSearchRoom("")
    setCurrentMode("none")
    setCurrentFloor(4)
    setSearchFocused(false)
    setSelectedRoomTypes([])
    setSelectedInstitution("")
  }

  const hasActiveOppositeFilter = () => {
    const getSubItemId = (parentLabel: string, subLabel: string, subId?: string): string => {
      return subId || `${parentLabel}:${subLabel}`
    }
    const oppositeValues = showRooms
      ? [...areaFilters, ...weeklyEventFilters, ...accessibilityFilters, institutionFilters].flatMap((f) => [
          f.label,
          ...f.subItems.map((s) => getSubItemId(f.label, s.label, s.id)),
        ])
      : roomFilters.flatMap((f) => [f.label, ...f.subItems.map((s) => getSubItemId(f.label, s.label, s.id))])
    return oppositeValues.includes(filterQuery)
  }

  return (
    <div className="filter-parent">
      <div
        className={`filter-wrapper ${!showRooms ? "visible" : "hidden"}`}
        style={{ transform: `scale(${filterScale})` }}
      >
        <ul className="ui-list">
          {areaFilters.map((filter, idx) => (
            <FilterItemComponent
              key={filter.label}
              filter={filter}
              idx={idx}
              category="area"
              radioName="filter"
              hoveredIdx={hoveredIdx}
              filterQuery={filterQuery}
              mode={mode}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onRadioChange={handleRadioChange}
            />
          ))}
          <div className="ui-divider" />
          {accessibilityFilters.map((filter, idx) => (
            <GridFilter
              key={filter.label}
              filter={filter}
              idx={idx}
              category="accessible"
              radioName="filter"
              hoveredIdx={hoveredIdx}
              filterQuery={filterQuery}
              mode={mode}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onRadioChange={handleRadioChange}
            />
          ))}

          {/* <GridFilter
            key={institutionFilters.label}
            filter={institutionFilters}
            idx={0}
            category="institution"
            radioName="filter"
            hoveredIdx={hoveredIdx}
            filterQuery={filterQuery}
            mode={mode}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onRadioChange={handleRadioChange}
          /> */}

          {/* {weeklyEventFilters.map((filter, idx) => (
            <GridFilter
              key={filter.label}
              filter={filter}
              idx={idx}
              category="weekly"
              radioName="filter"
              hoveredIdx={hoveredIdx}
              filterQuery={filterQuery}
              mode={mode}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onRadioChange={handleRadioChange}
            />
          ))} */}
          {/* {specialEventFilters.map((filter, idx) => (
            <GridFilter
              key={filter.label}
              filter={filter}
              idx={idx}
              category="special"
              radioName="filter"
              hoveredIdx={hoveredIdx}
              filterQuery={filterQuery}
              mode={mode}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onRadioChange={handleRadioChange}
            />
          ))} */}

          <div className="ui-divider" />

          <button
            className={`ui-button ${hoveredIdx?.list === "toggle" && hoveredIdx?.idx === 0 ? "active" : ""} ${hasActiveOppositeFilter() ? "has-badge" : ""}`}
            onMouseEnter={() => handleMouseEnter("toggle", 0)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleToggle()}
          >
            Rooms
          </button>
          {/* {livingFilters.map((filter, idx) => (
            <GridFilter
              key={filter.label}
              filter={filter}
              idx={idx}
              category="living"
              radioName="filter"
              hoveredIdx={hoveredIdx}
              filterQuery={filterQuery}
              mode={mode}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onRadioChange={handleRadioChange}
            />
          ))} */}
          <button
            className={`ui-button  ${hoveredIdx?.list === "clear" && hoveredIdx?.idx === 0 ? "active" : ""} ${!filterQuery && !searchRoom && currentFloor === 4 && !searchFocused ? "disabled" : ""}`}
            onMouseEnter={() => handleMouseEnter("clear", 0)}
            onMouseLeave={handleMouseLeave}
            onClick={clearFilter}
            disabled={!filterQuery && !searchRoom && currentFloor === 4 && !searchFocused}
          >
            Clear
          </button>
        </ul>
      </div>

      <div
        className={`filter-wrapper ${showRooms ? "visible" : "hidden"}`}
        style={{ transform: `scale(${filterScale})` }}
      >
        <ul className="ui-list">
          {/* Floor filters moved to dedicated left-side component */}
          {roomFilters.map((filter, idx) => (
            <FilterItemComponent
              key={filter.label}
              filter={filter}
              idx={idx}
              category="room"
              radioName="rooms"
              hoveredIdx={hoveredIdx}
              filterQuery={filterQuery}
              showLabel={!hoveredIdx || (hoveredIdx.list === "room" && hoveredIdx.idx === idx)}
              mode={mode}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onRadioChange={handleRadioChange}
            />
          ))}

          <div className="ui-divider" />

          <button
            className={`ui-button ${hoveredIdx?.list === "toggle" && hoveredIdx?.idx === 1 ? "active" : ""} ${hasActiveOppositeFilter() ? "has-badge" : ""}`}
            onMouseEnter={() => handleMouseEnter("toggle", 1)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleToggle()}
          >
            Close
          </button>

          <button
            className={`ui-button no-transform ${hoveredIdx?.list === "clear" && hoveredIdx?.idx === 1 ? "active" : ""} ${!filterQuery && !searchRoom && currentFloor === 4 && !searchFocused ? "disabled" : ""}`}
            onMouseEnter={() => handleMouseEnter("clear", 1)}
            onMouseLeave={handleMouseLeave}
            onClick={clearFilter}
            disabled={!filterQuery && !searchRoom && currentFloor === 4 && !searchFocused}
          >
            Clear
          </button>
        </ul>
      </div>
    </div>
  )
}

export default Filter
