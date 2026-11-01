// @ts-nocheck
import React, { useEffect, useMemo, useState, useRef, use } from "react"
import { useAtom } from "jotai"
import { Center, Instances, Instance, Stage, useGLTF, Text } from "@react-three/drei"
import { useControls, folder } from "leva"
import { StaticCollider } from "bvhecctrl"
import * as THREE from "three"

import ModelWithEdges from "@/components/misc/ModelWithEdges"
import CustomMesh from "@/components/misc/CustomMesh"
import { path, defaultSettings } from "@/store/base"
import { createTerrainHeightSampler } from "@/utils/helpers/terrainHeight"

import Trees from "@/components/foliage/Trees"
import Grass from "@/components/foliage/Grass"

const Foliage = () => {
  // TREES MODELS
  const refTree3 = useGLTF(`${path}/references/tree/ref-tree-03.glb`)
  const modelTree3 = useGLTF(`${path}/models/foliage/model-tree-03.glb`)

  const refTree2 = useGLTF(`${path}/references/tree/ref-tree-02.glb`)
  const modelTree2 = useGLTF(`${path}/models/foliage/model-tree-02.glb`)

  // Z position of trees
  // const terrainRef = useGLTF(`${path}/references/trees/terrain-ref.glb`)
  const raycastTerrain = useGLTF(`${path}/models/raycast/raycast-terrain.glb`)

  const refTrees = useGLTF(`${path}/references/ref-trees-compressed.glb`) // For reference only, not used in rendering - contains all tree positions

  const getTerrainHeight = useMemo(() => createTerrainHeightSampler(raycastTerrain), [raycastTerrain])

  const treeRes = [
    {
      refBush: refTree3,
      modelTree: modelTree3,
      leafColor: defaultSettings.tree1Color,
      logColor: "#5c5752",
      scale: 1.42,
      bushShadeIntensity: 34,
      scaleRandomness: 0.2,
    },
    {
      refBush: refTree2,
      modelTree: modelTree2,
      leafColor: defaultSettings.tree2Color,
      logColor: "#8d837b",
      scale: 1.13,
      bushShadeIntensity: 20,
      scaleRandomness: 0.07,
    },
  ]

  return (
    <>
      <Trees treeRes={treeRes} treesPosition={refTrees} terrain={raycastTerrain} />
      <Grass treePos={refTrees} terrain={raycastTerrain} />
    </>
  )
}

export default Foliage
