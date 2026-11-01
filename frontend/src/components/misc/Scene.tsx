import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { useEffect } from "react"
import { Mesh, SkinnedMesh } from "three"
import { CameraControls, PerspectiveCamera, PerformanceMonitor, BakeShadows } from "@react-three/drei"

import { Leva, useControls } from "leva"
import { Perf } from "r3f-perf"

import { Layout } from "@/ui/Layout"
import Experience from "./Experience"

import XRControls from "./XRControls"
import { XR, createXRStore } from "@react-three/xr"
const store = createXRStore()
import { useGLTF, Outlines, View } from "@react-three/drei"
import { path } from "@/store/base"
import FloorPlan from "./FloorPlan"
import { useAtom } from "jotai"
import { searchRoomAtom, isSearchModeAtom, isRoomLockedAtom } from "@/store/atom"
import { useClickHandler } from "@/hooks/useClickHandler"

// Background plane to catch clicks outside of rooms
const BackgroundPlane = () => {
  const [searchRoom, setSearchRoom] = useAtom(searchRoomAtom)
  const [isSearchMode] = useAtom(isSearchModeAtom)
  const [isLocked] = useAtom(isRoomLockedAtom)
  const { handleBackgroundClick, handleBackgroundPointerDown } = useClickHandler()

  const handleClick = (e: any) => {
    handleBackgroundClick(e)
  }

  const handlePointerDown = (e: any) => {
    handleBackgroundPointerDown(e)
  }

  return (
    <mesh
      position={[0, 0, -10]}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      // Make it invisible but still clickable
      visible={false}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

const Scene = () => {
  const testCube = useGLTF(`${path}/models/campus/test-cube.glb`)

  const { cameraControls, showPerf, showCube } = useControls(
    "🎥 Scene",
    {
      cameraControls: { value: true, label: "Camera Controls" },
      showPerf: { value: true, label: "Performance Monitor" },
      showCube: { value: true, label: "Show Test Cube" },
    },
    { collapsed: true }
  )

  return (
    <>
      <Leva />
      <Layout />

      <Canvas gl={{ alpha: true, antialias: true }} id={"webgl-canvas"} dpr={[1, 2]} frameloop="always" shadows>
        {/* <BakeShadows /> */}

        {/* <PerformanceMonitor onIncline={() => console.log("Incline")} onDecline={() => console.log("Decline")} /> */}
        <color attach="background" args={["#898989"]} />
        {/* <XRControls store={store}> */}
        <BackgroundPlane />
        <FloorPlan />

        {/* <Experience /> */}

        <PerspectiveCamera makeDefault position={[0, 0, 40]} fov={75} near={0.1} far={1000} />

        {cameraControls && <CameraControls />}
        {/* </XRControls> */}
        {<Perf deepAnalyze matrixUpdate={true} position={"bottom-left"} minimal={!showPerf} />}
      </Canvas>
    </>
  )
}

export default Scene
