import React, { useMemo } from "react"
import * as THREE from "three"
import { createInstances } from "@react-three/drei"
import { useControls } from "leva"

import { mulberry32 } from "@/utils/helpers/mulberry32"
import { hexToHSL, hslToHex } from "@/utils/helpers/color"
import { createTerrainHeightSampler } from "@/utils/helpers/terrainHeight"

import { TreeGeometry, TreeMaterial } from "@/components/foliage/Tree"
import { BushGeometry, BushMaterial } from "@/components/foliage/Bush"

// Utility to shuffle an array using a seeded random function
function shuffleArray<T>(array: T[], randomFn: () => number): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Utility to split array into N chunks (optionally shuffled)
function splitIntoChunks<T>(array: T[], n: number): T[][] {
  const chunks: T[][] = Array.from({ length: n }, () => [])
  array.forEach((item, i) => {
    chunks[i % n].push(item)
  })
  return chunks
}

// Add type for treeRes prop
type TreeResItem = {
  refBush: any
  modelTree: any
  leafColor?: string
  logColor?: string
  scale?: number
  bushShadeIntensity?: number
  scaleRandomness?: number
}
type TreesProps = {
  treeRes: TreeResItem[]
  treesPosition: any
  terrain?: any // Add terrain parameter
}

const Trees = ({ treeRes, treesPosition, terrain }: TreesProps) => {
  // determestic randomnes seed
  const seed = useControls(
    "🌳 Trees",
    { seed: { value: 18088, min: 0, max: 100000, step: 1, label: "Seed" } },
    { collapsed: true }
  ).seed

  // Use mulberry32 for deterministic shuffling
  const randomFn = useMemo(() => mulberry32(seed), [seed])
  const shuffledChildren = useMemo(
    () => shuffleArray(treesPosition.scene.children, randomFn),
    [treesPosition.scene.children, randomFn]
  )
  const childrenChunks = useMemo(
    () => splitIntoChunks(shuffledChildren, treeRes.length),
    [shuffledChildren, treeRes.length]
  )

  // Use the reusable terrain height sampler
  const getTerrainHeight = useMemo(() => createTerrainHeightSampler(terrain), [terrain])

  return (
    <group>
      {treeRes.map(
        ({ refBush, modelTree, leafColor, logColor, scale, bushShadeIntensity, scaleRandomness }, treeTypeIndex) => {
          // Create unique instances for each tree type
          const [TreeLogInstances, TreeLogIn] = createInstances()
          const [BushInstances, BushIn] = createInstances()

          // Use only the chunk for this tree type
          const chunk = childrenChunks[treeTypeIndex] || []

          // Unique controls for each tree type, without a seed
          const controls = useControls(
            `🌲 Tree ${treeTypeIndex + 1}`,
            {
              bushColor: { value: leafColor ?? "#bde595", label: "Leafs Color" },
              treeColor: { value: logColor ?? "#5c5752", label: "Log Color" },
              scale: { value: scale ?? 1, min: 0.1, max: 2, step: 0.01, label: "Scale" },
              bushShadeIntensity: {
                value: bushShadeIntensity ?? 0,
                min: 0,
                max: 50,
                step: 1,
                label: "Leafs Shade Intensity",
              },
              scaleRandomness: { value: scaleRandomness ?? 0, min: 0, max: 0.2, step: 0.01, label: "Scale Randomness" },
            },
            { collapsed: true }
          )

          return (
            <TreeLogInstances key={treeTypeIndex} castShadow receiveShadow>
              <TreeGeometry modelTree={modelTree} />
              <TreeMaterial color={controls.treeColor} />
              <BushInstances castShadow receiveShadow>
                <BushGeometry />
                <BushMaterial color={controls.bushColor} />

                {chunk.map((child, index) => {
                  const position = new THREE.Vector3()
                  child.getWorldPosition(position)

                  // Get terrain height and adjust Y position
                  const terrainHeight = getTerrainHeight(position.x, position.z)
                  position.y = terrainHeight

                  // Use the global seed for deterministic randomness
                  const randomRotationFunc = mulberry32(seed + treeTypeIndex * 1000 + index)
                  const randomRotation = randomRotationFunc() * Math.PI * 2

                  // Add minimal randomness to scale, controlled by slider
                  const base = 1 - controls.scaleRandomness
                  const range = controls.scaleRandomness * 2
                  const randomScale = controls.scale * (base + randomRotationFunc() * range)

                  // Generate a random shade for the bush color
                  const baseHSL = hexToHSL(controls.bushColor)
                  const intensity = controls.bushShadeIntensity ?? 20
                  const randomLightness = baseHSL.l + (randomRotationFunc() - 0.5) * intensity
                  const bushColor = hslToHex({
                    ...baseHSL,
                    l: Math.max(0, Math.min(100, randomLightness)),
                  })

                  return (
                    <group key={index}>
                      <TreeLogIn
                        key={index}
                        position={[position.x, position.y, position.z]}
                        scale={randomScale}
                        rotation={[0, randomRotation, 0]}
                      />
                      {refBush.scene.children.map((bushChild, bushIndex) => {
                        const bushPosition = new THREE.Vector3()
                        bushChild.getWorldPosition(bushPosition)
                        return (
                          <group
                            position={[position.x, position.y, position.z]}
                            key={`${index}-${bushIndex}`}
                            rotation={[0, randomRotation, 0]}
                            scale={randomScale}
                          >
                            <BushIn key={`${index}-${bushIndex}`} position={bushPosition} color={bushColor} />
                          </group>
                        )
                      })}
                    </group>
                  )
                })}
              </BushInstances>
            </TreeLogInstances>
          )
        }
      )}
    </group>
  )
}

export default Trees
