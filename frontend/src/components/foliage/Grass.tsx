import { useRef, useMemo } from "react"
import * as THREE from "three"
import { Mesh, PlaneGeometry, Matrix4 } from "three"
import { useControls } from "leva"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

import { grass } from "@/shaders/tsl/grass-shader"
import { createTerrainHeightSampler } from "@/utils/helpers/terrainHeight"
import { defaultSettings } from "@/store/base"

interface GrassProps {
  treePos: any
  terrain?: any
}

const Grass = ({ treePos, terrain }: GrassProps) => {
  const planeRef = useRef<Mesh>(null)

  const {
    scale,
    windSpeed,
    windSize,
    windDisplacement,
    upBias,
    bladesPerPoint,
    clusterRadius,
    heightMin,
    heightMax,
    widthMin,
    widthMax,
    colorA,
    colorB,
    baseDarkness,
    colorSamples,
  } = useControls(
    "Grass",
    {
      scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
      windSpeed: { value: 0.4, min: 0, max: 2, step: 0.01 },
      windSize: { value: 0.3, min: 0.1, max: 5, step: 0.01 },
      windDisplacement: { value: 0.1, min: 0, max: 2, step: 0.01 },
      upBias: { value: 1.5, min: 0, max: 3, step: 0.01 },
      bladesPerPoint: { value: 10, min: 1, max: 200, step: 1 },
      clusterRadius: { value: 1.27, min: 0, max: 2, step: 0.01 },
      heightMin: { value: 0.5, min: 0, max: 2, step: 0.01 },
      heightMax: { value: 0.8, min: 0, max: 2, step: 0.01 },
      widthMin: { value: 0, min: 0, max: 1, step: 0.01 },
      widthMax: { value: 0.32, min: 0, max: 1, step: 0.01 },
      colorA: { value: defaultSettings.colorAGrass },
      colorB: { value: defaultSettings.colorBGrass },
      baseDarkness: { value: 0.7, min: 0, max: 1, step: 0.01 },
      colorSamples: { value: 4, min: 2, max: 10, step: 1 },
    },
    { collapsed: true }
  )

  // Use the reusable terrain height sampler
  const getTerrainHeight = useMemo(() => createTerrainHeightSampler(terrain), [terrain])

  // Create a merged geometry of planes at each tree position
  const mergedPlaneGeometry = useMemo(() => {
    const children = treePos.scene.children
    const planeGeometries = children.map((child) => {
      const geom = new PlaneGeometry(1.3, 1.3, 2, 2)
      geom.rotateX(-Math.PI / 2)

      // Get terrain height and adjust position
      const terrainHeight = getTerrainHeight(child.position.x, child.position.z)
      const matrix = new Matrix4().setPosition(child.position.x, terrainHeight, child.position.z)
      geom.applyMatrix4(matrix)
      return geom
    })
    // Merge all plane geometries into one
    return BufferGeometryUtils.mergeGeometries(planeGeometries)
  }, [treePos.scene.children, getTerrainHeight])

  const { geometry: fullGrassGeometry, positionNode } = useMemo(
    () =>
      grass({
        geometry: mergedPlaneGeometry,
        windSpeed,
        windSize,
        windDisplacement,
        upBias,
        bladesPerPoint,
        clusterRadius,
        heightVariation: { min: heightMin, max: heightMax },
        widthVariation: { min: widthMin, max: widthMax },
        colorA,
        colorB,
        baseDarkness,
        colorSamples,
      }),
    [
      mergedPlaneGeometry,
      windSpeed,
      windSize,
      windDisplacement,
      upBias,
      bladesPerPoint,
      clusterRadius,
      heightMin,
      heightMax,
      widthMin,
      widthMax,
      colorA,
      colorB,
      baseDarkness,
      colorSamples,
    ]
  )

  return (
    <>
      <group scale={scale} receiveShadow>
        <mesh geometry={fullGrassGeometry} receiveShadow ref={planeRef} rotation={[0, 0, 0]}>
          <meshStandardNodeMaterial positionNode={positionNode} vertexColors />
        </mesh>
      </group>
    </>
  )
}

export default Grass
