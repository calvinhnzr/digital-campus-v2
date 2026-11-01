import React, { useEffect, useMemo, useState, useRef, use } from "react"
import { useAtom } from "jotai"
import { Center, Instances, Instance, Stage, useGLTF, Text } from "@react-three/drei"
import { useControls, folder } from "leva"
import * as THREE from "three"

import ModelWithEdges from "@/components/misc/ModelWithEdges"
import CustomMesh from "@/components/misc/CustomMesh"
import { path } from "@/store/base"
import { createTerrainHeightSampler } from "@/utils/helpers/terrainHeight"

import { useRefData } from "@/hooks/useRefData"
import { ref } from "node:process"

const Props = () => {
  const refData = useRefData()
  // Lights

  const refLightPlaza = refData.lightsPlaza
  const modelLightPlaza = useGLTF(`${path}/models/props/lights/light-plaza.glb`)
  const modelLightPlazaBloom = useGLTF(`${path}/models/props/lights/light-plaza-bloom.glb`)

  const refLightParking = refData.lightsParking
  const modelLightParking = useGLTF(`${path}/models/props/lights/light-parking.glb`)
  const modelLightParkingBloom = useGLTF(`${path}/models/props/lights/light-parking-bloom.glb`)

  const refBench1 = useGLTF(`${path}/references/benches/ref-bench-01.glb`)
  const modelBench1 = useGLTF(`${path}/models/props/benches/model-bench-01.glb`)

  const underpassPost = useGLTF(`${path}/models/props/underpass/underpass-post.glb`)
  const underpassRoof = useGLTF(`${path}/models/props/underpass/underpass-roof.glb`)

  // // Z position of trees
  // const terrainRef = useGLTF(`${path}/references/trees/terrain-ref.glb`)
  const raycastTerrain = useGLTF(`${path}/models/raycast/raycast-terrain.glb`)

  // // Create terrain height sampler for lamps
  const getTerrainHeight = useMemo(() => createTerrainHeightSampler(raycastTerrain), [raycastTerrain])

  return (
    <>
      {refLightPlaza.scene.children.map((child, index) => {
        const position = new THREE.Vector3()
        child.getWorldPosition(position)

        // Get terrain height and adjust Y position
        const terrainHeight = getTerrainHeight(position.x, position.z)

        return (
          <group position={[position.x, terrainHeight, position.z]} key={index}>
            <CustomMesh model={modelLightPlaza} castShadow receiveShadow color="#636769" />
            <CustomMesh model={modelLightPlazaBloom} castShadow receiveShadow />
          </group>
        )
      })}

      {refLightParking.scene.children.map((child, index) => {
        const position = new THREE.Vector3()
        child.getWorldPosition(position)

        // Get terrain height and adjust Y position
        const terrainHeight = getTerrainHeight(position.x, position.z)

        return (
          <group position={[position.x, terrainHeight, position.z]} key={index}>
            <CustomMesh model={modelLightParking} castShadow receiveShadow color="#969fa3" />
            <CustomMesh model={modelLightParkingBloom} castShadow receiveShadow />
          </group>
        )
      })}

      {/* <group>
        <ModelWithEdges model={refBench1} />
        <CustomMesh model={underpassPost} color="#7a7b8c" castShadow receiveShadow />
        <CustomMesh model={underpassRoof} color="#e77845" castShadow receiveShadow />
      </group> */}
    </>
  )
}

export default Props
