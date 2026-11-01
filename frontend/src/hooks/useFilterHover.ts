import { useState, useRef, useCallback, useEffect } from "react"
import { HoveredState, FilterCategory } from "@/types/filter"

export const useFilterHover = (isDisabled: boolean = false) => {
  const [hoveredIdx, setHoveredIdx] = useState<HoveredState | null>(null)
  const closeTimer = useRef<NodeJS.Timeout | null>(null)

  // Clear hover state when disabled (during animation)
  useEffect(() => {
    if (isDisabled) {
      setHoveredIdx(null)
      if (closeTimer.current) {
        clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
    }
  }, [isDisabled])

  const handleMouseEnter = useCallback(
    (list: FilterCategory, idx: number) => {
      // Don't update hover state if disabled
      if (isDisabled) return

      if (closeTimer.current) {
        clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
      setHoveredIdx({ list, idx })
    },
    [isDisabled]
  )

  const handleMouseLeave = useCallback(() => {
    // Don't update hover state if disabled
    if (isDisabled) return

    closeTimer.current = setTimeout(() => {
      setHoveredIdx(null)
    }, 500)
  }, [isDisabled])

  return {
    hoveredIdx,
    handleMouseEnter,
    handleMouseLeave,
  }
}
