import React, { useMemo } from "react"
import * as THREE from "three"
import styled from "@emotion/styled"
import { useGLTF, Html } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useAtom } from "jotai"
import { GLTF } from "three-stdlib"
import { FaDoorOpen, FaDoorClosed, FaBicycle, FaCar, FaWheelchair, FaMugHot } from "react-icons/fa"

import { usePoiData } from "@/hooks/usePoiData"

import { path, colors } from "@/store/base"
import { filterQueryAtom, searchRoomAtom } from "@/store/atom"
import { createTerrainHeightSampler } from "@/utils/helpers/terrainHeight"
import { ref } from "process"

interface HighlightLayerConfig {
  [key: string]: {
    items: Array<{
      ref: GLTF
      icon: React.ReactElement
      color: string
      image?: string
    }>
  }
}

export const Icon = styled.div<{ animate?: boolean; color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: white;
  /* background: coral; */
  border-radius: 50%;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
  transform-origin: center;
  will-change: transform, opacity;

  /* pop-in animation - can be disabled via prop */
  animation: ${(p) => (p.animate === false ? "none" : "popIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both")};
  color: ${(p) => p.color};

  @keyframes popIn {
    0% {
      opacity: 0;
      transform: scale(0.6);
    }
    60% {
      opacity: 1;
      transform: scale(1.08);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`

export const CircleImage = styled.div<{ animate?: boolean }>`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.25),
    inset 0 -2px 6px rgba(0, 0, 0, 0.15);
  transform-origin: center;
  will-change: transform, opacity;
  animation: ${(p) => (p.animate === false ? "none" : "popIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both")};
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(255, 255, 255, 0) 50%,
      rgba(0, 0, 0, 0.15) 100%
    );
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes popIn {
    0% {
      opacity: 0;
      transform: scale(0.6);
    }
    60% {
      opacity: 1;
      transform: scale(1.08);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`

const HighlightLayer = ({
  animate = true,
  order = "near-to-far",
}: {
  animate?: boolean
  order?: "left-to-right" | "near-to-far" | "world-left-to-right"
}) => {
  const [filterQuery, setFilterQuery] = useAtom(filterQueryAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchRoomAtom)
  const { camera, size } = useThree()

  const raycastTerrain = useGLTF(`${path}/models/raycast/raycast-terrain.glb`)
  const getTerrainHeight = useMemo(() => createTerrainHeightSampler(raycastTerrain), [raycastTerrain])

  const poiData = usePoiData()

  // Map filter types to their corresponding refs and configurations
  const filterConfig: HighlightLayerConfig = {
    entrances: {
      items: [{ ref: poiData.entrances, icon: <FaDoorOpen />, color: colors.highlightLayer }],
    },
    exits: {
      items: [{ ref: poiData.exits, icon: <FaDoorClosed />, color: colors.highlightLayer }],
    },
    bike: {
      items: [{ ref: poiData.bike, icon: <FaBicycle />, color: colors.highlightLayer }],
    },
    car: {
      items: [{ ref: poiData.car, icon: <FaCar />, color: colors.highlightLayer }],
    },
    employees: {
      items: [{ ref: poiData.restricted, icon: <FaCar />, color: colors.highlightLayer }],
    },
    disabled: {
      items: [{ ref: poiData.disabled, icon: <FaWheelchair />, color: colors.highlightLayer }],
    },
  }

  // Get current filter configuration
  // Extract the actual filter key from composite IDs (e.g., "entrances:accessible" -> "accessible")
  const filterKey = filterQuery.includes(":") ? filterQuery.split(":")[1] : filterQuery
  const currentConfig = filterConfig[filterKey as keyof typeof filterConfig]

  if (!currentConfig) return null

  // Map children to screen-X so we can sort left-to-right relative to camera
  type Item = {
    child: THREE.Object3D
    index: number
    position: THREE.Vector3
    terrainHeight: number
    screenX: number
    distance?: number
    icon: React.ReactElement
    color: string
    image?: string
  }

  const items: Item[] = currentConfig.items.flatMap((item) =>
    item.ref.scene.children.map((child, index) => {
      const position = new THREE.Vector3()
      child.getWorldPosition(position)

      // Project world position to NDC space to get screen X
      const ndc = position.clone().project(camera)
      const screenX = ndc.x // in [-1, 1], ordering preserved

      // Get terrain height and adjust Y position
      const terrainHeight = getTerrainHeight(position.x, position.z)

      return { child, index, position, terrainHeight, screenX, icon: item.icon, color: item.color, image: item.image }
    })
  )

  // sort items according to the requested ordering
  switch (order) {
    case "left-to-right":
      // sort by screen X ascending so left-most items appear first (camera-relative)
      items.sort((a, b) => a.screenX - b.screenX)
      break

    case "world-left-to-right":
      // sort by world X coordinate ascending so left-most in world space appear first
      items.sort((a, b) => a.position.x - b.position.x)
      break

    case "near-to-far":
    default:
      // sort by distance to camera (closest first)
      items.forEach((it) => {
        // compute distance from camera to world position
        it.distance = camera.position.distanceTo(it.position)
      })
      items.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      break
  }

  return (
    <>
      {items.map((item, sortedIndex) => {
        const { child, index, position, terrainHeight, icon, color, image } = item

        const key = `${filterQuery}-${index}-${child.uuid}`

        return (
          <group position={[position.x, terrainHeight, position.z]} key={key}>
            <Html position={[0, 1, 0]} zIndexRange={[1000, 0]} style={{ pointerEvents: "none" }}>
              {image ? (
                <CircleImage
                  animate={animate}
                  style={animate ? { animationDelay: `${sortedIndex * 60}ms` } : undefined}
                >
                  <img src={image} alt="" />
                </CircleImage>
              ) : (
                <Icon
                  color={color}
                  animate={animate}
                  style={animate ? { animationDelay: `${sortedIndex * 60}ms` } : undefined}
                >
                  {icon}
                </Icon>
              )}
            </Html>
          </group>
        )
      })}
    </>
  )
}

export default HighlightLayer
