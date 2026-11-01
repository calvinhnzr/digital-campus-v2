import { useEffect, useRef, useMemo } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useAtom } from "jotai"
import { searchRoomAtom } from "@/store/atom"
import { useFloorPlanData } from "@/hooks/useFloorPlanData"

const WORLD_CENTER = new THREE.Vector3(100, 0, 20)
const DEFAULT_CAMERA_POS = new THREE.Vector3(30, 90, 200)
const LERP_SPEED = 3 // animation smoothness (higher = faster)
const MIN_DISTANCE = 90
const MAX_DISTANCE = 250

/**
 * Animates the camera to frame searched rooms while respecting OrbitControls distance limits.
 * When the search is cleared, animates back to the default camera position / world center.
 */
const CameraSearchAnimation = () => {
  const [searchQuery] = useAtom(searchRoomAtom)
  const floorPlanData = useFloorPlanData()
  const { controls, camera } = useThree()

  const targetRef = useRef(new THREE.Vector3().copy(WORLD_CENTER))
  const positionRef = useRef(new THREE.Vector3().copy(camera.position))
  const isAnimating = useRef(false)

  // Cancel animation immediately when user starts interacting with controls
  useEffect(() => {
    if (!controls) return
    const onStart = () => {
      isAnimating.current = false
    }
    ;(controls as any).addEventListener("start", onStart)
    return () => {
      ;(controls as any).removeEventListener("start", onStart)
    }
  }, [controls])

  // Find the center of all matching rooms
  const searchTarget = useMemo(() => {
    if (!searchQuery) return null

    const positions: THREE.Vector3[] = []

    Object.entries(floorPlanData).forEach(([, building]) => {
      Object.entries(building).forEach(([, floor]) => {
        const roomsGltf = (floor as any).rooms
        if (!roomsGltf?.scene) return

        roomsGltf.scene.traverse((child: any) => {
          if (!child?.isMesh) return
          if (child.name === searchQuery) {
            const box = new THREE.Box3().setFromObject(child)
            const center = box.getCenter(new THREE.Vector3())
            positions.push(center)
          }
        })
      })
    })

    if (positions.length === 0) return null

    const bbox = new THREE.Box3()
    positions.forEach((p) => bbox.expandByPoint(p))
    return bbox.getCenter(new THREE.Vector3())
  }, [floorPlanData, searchQuery])

  const hadRoomMatch = useRef(false)

  // Animate to room on match; back to default only when search is fully emptied
  useEffect(() => {
    if (!controls) return

    if (searchTarget) {
      // Room found — animate to it
      targetRef.current.copy(searchTarget)

      const orbitControls = controls as any
      const currentTarget = orbitControls.target as THREE.Vector3
      const dir = new THREE.Vector3().subVectors(camera.position, currentTarget).normalize()

      positionRef.current.copy(searchTarget).add(dir.multiplyScalar(MIN_DISTANCE))

      isAnimating.current = true
      hadRoomMatch.current = true
    } else if (searchQuery === "" && hadRoomMatch.current) {
      // Search fully cleared — animate back to default view
      targetRef.current.copy(WORLD_CENTER)
      positionRef.current.copy(DEFAULT_CAMERA_POS)

      isAnimating.current = true
      hadRoomMatch.current = false
    } else {
      // Typing but no match yet — stop animation, free rotation
      isAnimating.current = false
    }
  }, [searchTarget, searchQuery, camera, controls])

  useFrame((_, delta) => {
    if (!isAnimating.current || !controls) return

    const orbitControls = controls as any
    const currentTarget = orbitControls.target as THREE.Vector3
    const t = 1 - Math.exp(-LERP_SPEED * delta)

    // Lerp target and position
    currentTarget.lerp(targetRef.current, t)
    camera.position.lerp(positionRef.current, t)
    orbitControls.update()

    // Stop when close enough
    const targetDist = currentTarget.distanceTo(targetRef.current)
    const posDist = camera.position.distanceTo(positionRef.current)
    if (targetDist < 0.05 && posDist < 0.05) {
      currentTarget.copy(targetRef.current)
      camera.position.copy(positionRef.current)
      orbitControls.update()
      isAnimating.current = false
    }
  })

  return null
}

export default CameraSearchAnimation
