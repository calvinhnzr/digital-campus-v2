import { useState, useCallback } from "react"
import { useAtom } from "jotai"
import { filterQueryAtom } from "@/store/atom"

export const useFilterToggle = () => {
  const [showRooms, setShowRooms] = useState(false)
  const [filterScale, setFilterScale] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [, setFilterQuery] = useAtom(filterQueryAtom)

  const handleToggle = useCallback(() => {
    // Disable hover effects during animation
    setIsAnimating(true)

    // Start the animation immediately
    setFilterScale(0.1)

    // Small delay before switching to make scale-down visible
    setTimeout(() => {
      setShowRooms((prev) => !prev)
    }, 150)

    // Restore scale after animation and re-enable hover
    setTimeout(() => {
      setFilterScale(1)
    }, 200)

    // Re-enable hover after full animation completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }, [])

  return {
    showRooms,
    filterScale,
    isAnimating,
    handleToggle,
  }
}
