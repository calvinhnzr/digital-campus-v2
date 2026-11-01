import React, { useRef, useEffect, useState } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { createRoot } from "react-dom/client"
import { Canvas } from "@react-three/fiber"
import { useControls } from "leva"
import styled from "@emotion/styled"
import { useAtom } from "jotai"

import { showFloorPlanAtom } from "@/store/atom"

import FloorPlanMerged from "@/components/floorplan/FloorPlanMerged"

import CardLayer from "@/components/layer/CardLayer"
import PoiLayer from "@/components/layer/PoiLayer"
// Controls live on the main canvas; no controls in overlay

/**
 * FloorPlanOverlayRenderer Component
 * Creates a second WebGL renderer as an overlay for the floorplan
 * Syncs camera rotation with the main scene camera
 */

// Styled overlay container
const OverlayContainer = styled.div<{ opacity: number; zIndex: number; allowPointerEvents: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${(props) => (props.allowPointerEvents ? "auto" : "none")};
  z-index: ${(props) => props.zIndex};
  opacity: ${(props) => props.opacity};
  transition: opacity 0.3s ease;
`

// Styled canvas wrapper
const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: none;
`

// Internal component that runs inside the overlay Canvas
const FloorPlanOverlayContent = ({ mainCamera }: { mainCamera: THREE.Camera | null }) => {
  const { camera } = useThree()

  // Sync OVERLAY camera from MAIN camera (authoritative source)
  // Doing it this way prevents a one-frame lag due to separate RAF loops
  useFrame(() => {
    if (!mainCamera || !camera) return

    // Copy transforms from main camera to this overlay camera
    camera.position.copy(mainCamera.position)
    camera.quaternion.copy(mainCamera.quaternion)
    camera.rotation.copy(mainCamera.rotation)

    // Sync projection parameters
    if (mainCamera instanceof THREE.PerspectiveCamera && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = mainCamera.fov
      camera.near = mainCamera.near
      camera.far = mainCamera.far
      camera.zoom = mainCamera.zoom
      camera.updateProjectionMatrix()
    } else if (mainCamera instanceof THREE.OrthographicCamera && camera instanceof THREE.OrthographicCamera) {
      camera.left = mainCamera.left
      camera.right = mainCamera.right
      camera.top = mainCamera.top
      camera.bottom = mainCamera.bottom
      camera.near = mainCamera.near
      camera.far = mainCamera.far
      camera.zoom = mainCamera.zoom
      camera.updateProjectionMatrix()
    }

    camera.updateMatrixWorld()
  })

  return (
    <>
      {/* Controls live on the MAIN canvas so that camera state has a single source of truth.
          If you need overlay interactions, consider forwarding events to the main controls. */}
      <FloorPlanMerged />

      {/* point PoI */}
      <PoiLayer />

      {/* Room card */}
      <CardLayer />
    </>
  )
}

// Main overlay component
const FloorPlanOverlay = () => {
  const { camera: mainCamera } = useThree()
  const [overlayRoot, setOverlayRoot] = useState<any>(null)

  const [showFloorPlan] = useAtom(showFloorPlanAtom)

  // Use atom for enabled state, keep other controls in Leva for debugging
  const { opacity, zIndex, allowPointerEvents } = useControls(
    "🗺️ Floorplan Overlay",
    {
      opacity: { value: 1, min: 0, max: 1, step: 0.01, label: "Opacity" },
      zIndex: { value: 10, min: 0, max: 100, step: 1, label: "Z-Index" },
      // Default to no pointer events so the main scene can be controlled
      allowPointerEvents: { value: false, label: "Allow Clicks (Overlay)" },
    },
    { collapsed: false }
  )

  useEffect(() => {
    if (showFloorPlan) return // Don't create overlay when hidden (inverted logic)

    // Get the root element
    const rootElement = document.getElementById("root")
    if (!rootElement) {
      console.error("Root element not found")
      return
    }

    // Create a new div for the overlay canvas
    const overlayDiv = document.createElement("div")
    overlayDiv.id = "floorplan-overlay-container"

    rootElement.appendChild(overlayDiv)

    // Create React root for the overlay
    const root = createRoot(overlayDiv)
    setOverlayRoot({ root, div: overlayDiv })

    return () => {
      // Cleanup
      root.unmount()
      if (rootElement.contains(overlayDiv)) {
        rootElement.removeChild(overlayDiv)
      }
    }
  }, [showFloorPlan])

  // Update overlay styles when controls change
  useEffect(() => {
    if (overlayRoot?.root && mainCamera) {
      const cameraPosition = mainCamera.position.toArray() as [number, number, number]
      const cameraFov = (mainCamera as THREE.PerspectiveCamera).fov || 75

      overlayRoot.root.render(
        <OverlayContainer opacity={opacity} zIndex={zIndex} allowPointerEvents={allowPointerEvents}>
          <Canvas
            dpr={[1, 2]} // lower resolution for overlay to reduce GPU cost
            camera={{
              position: cameraPosition,
              fov: cameraFov,
            }}
            gl={{
              alpha: true,
              antialias: true, // AA off for overlay for perf; main canvas handles quality
              // powerPreference: "low-power",
            }}
            shadows={false}
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: allowPointerEvents ? "auto" : "none",
            }}
          >
            <ambientLight intensity={1} />

            <FloorPlanOverlayContent mainCamera={mainCamera} />
          </Canvas>
        </OverlayContainer>
      )
    }
  }, [opacity, zIndex, allowPointerEvents, overlayRoot, mainCamera])

  // This component doesn't render anything in the main scene
  return null
}

export default FloorPlanOverlay
