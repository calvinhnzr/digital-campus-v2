import * as THREE from "three/webgpu"
import { useFrame, useThree } from "@react-three/fiber"

import BackgroundSphere from "@/components/misc/BackgroundSphere"
import Campus from "@/components/scene/Campus"
import Terrain from "@/components/terrain/Terrain"

import Stage from "@/components/scene/Stage"
import Foliage from "@/components/foliage/Foliage"
import Props from "@/components/props/Props"
import FloorPlanOverlay from "@/components/floorplan/FloorPlanOverlay"
import FloorPlanMerged from "@/components/floorplan/FloorPlanMerged"

// Background plane to catch clicks outside of rooms

const Experience = () => {
  return (
    <>
      <Stage />
      <BackgroundSphere />
      <Campus />
      <Terrain />
      <Foliage />
      <Props />

      <FloorPlanOverlay />
      <FloorPlanMerged pickingOnly />
    </>
  )
}

export default Experience
