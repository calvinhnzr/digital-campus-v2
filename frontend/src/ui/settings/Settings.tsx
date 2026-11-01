import React, { useState, useRef, useEffect } from "react"
import { useAtom } from "jotai"
import { showFloorPlanAtom, showAllFloorsInSearchAtom } from "@/store/atom"
import {
  SettingsContainer,
  SettingsButton,
  SettingsCard,
  SettingsItem,
  SettingsLabel,
  Checkbox,
} from "./Settings.styles.ts"
import type { UIMode } from "@/ui/Layout"

interface SettingsProps {
  mode?: UIMode
}

const Settings: React.FC<SettingsProps> = ({ mode = "default" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useAtom(showFloorPlanAtom)
  const [showAllFloorsInSearch, setShowAllFloorsInSearch] = useAtom(showAllFloorsInSearchAtom)
  const cardRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggleFloorPlan = () => {
    setShowFloorPlan((prev) => !prev)
  }

  const handleToggleAllFloorsInSearch = () => {
    setShowAllFloorsInSearch((prev) => !prev)
  }

  return (
    <SettingsContainer>
      <SettingsButton ref={buttonRef} onClick={() => setIsOpen(!isOpen)} $active={isOpen} $mode={mode} title="Settings">
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
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </SettingsButton>

      {isOpen && (
        <SettingsCard ref={cardRef} $mode={mode}>
          <SettingsItem>
            <SettingsLabel>
              <Checkbox type="checkbox" checked={showFloorPlan} onChange={handleToggleFloorPlan} $mode={mode} />
              Show Floorplan
            </SettingsLabel>
          </SettingsItem>
          <SettingsItem>
            <SettingsLabel>
              <Checkbox
                type="checkbox"
                checked={showAllFloorsInSearch}
                onChange={handleToggleAllFloorsInSearch}
                $mode={mode}
              />
              Show All Floors in Search
            </SettingsLabel>
          </SettingsItem>
        </SettingsCard>
      )}
    </SettingsContainer>
  )
}

export default Settings
