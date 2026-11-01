import { useMemo, useRef } from "react"
import * as THREE from "three"
import { MeshSurfaceSampler } from "three-stdlib"
import { useControls } from "leva"

import { grass } from "@/shaders/tsl/grass-shader"

type BufferGeometry = THREE.BufferGeometry

export interface GrassOnGeometryProps {
  geometry: BufferGeometry | null | undefined
  /** Optional source object; when provided, its world transform is applied to sampled points */
  object?: THREE.Object3D | null
  /** Number of sample points on the surface (each produces a cluster of blades) */
  samples?: number
  /** Uniform scale of the resulting grass mesh */
  scale?: number
  // Grass shader and distribution controls
  windSpeed?: number
  windSize?: number
  windDisplacement?: number
  upBias?: number
  bladesPerPoint?: number
  clusterRadius?: number
  heightMin?: number
  heightMax?: number
  widthMin?: number
  widthMax?: number
  colorA?: string
  colorB?: string
  baseDarkness?: number
  colorSamples?: number
  castShadow?: boolean
  receiveShadow?: boolean
  /** Small offset along the sampled normal to prevent z-fighting/occlusion */
  offsetAlongNormal?: number
}

/**
 * Scatter grass blades uniformly at random across any input BufferGeometry using surface sampling.
 * The input geometry is only used to derive sample positions and normals; blades are generated via the grass shader.
 */
export default function GrassOnGeometry({
  geometry,
  object,
  samples: samplesProp,
  scale: scaleProp,
  windSpeed: windSpeedProp,
  windSize: windSizeProp,
  windDisplacement: windDisplacementProp,
  upBias: upBiasProp,
  bladesPerPoint: bladesPerPointProp,
  clusterRadius: clusterRadiusProp,
  heightMin: heightMinProp,
  heightMax: heightMaxProp,
  widthMin: widthMinProp,
  widthMax: widthMaxProp,
  colorA: colorAProp,
  colorB: colorBProp,
  baseDarkness: baseDarknessProp,
  colorSamples: colorSamplesProp,
  castShadow = false,
  receiveShadow = true,
  offsetAlongNormal: offsetAlongNormalProp,
}: GrassOnGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Leva controls (props override these when provided)
  const ctrl = useControls(
    "🌾 Grass Surface",
    {
      scale: { value: 1, min: 0.1, max: 10, step: 0.1 },
      samples: { value: 3500, min: 100, max: 20000, step: 100 },
      offsetAlongNormal: { value: 0.015, min: 0, max: 0.1, step: 0.001 },
      bladesPerPoint: { value: 20, min: 1, max: 200, step: 1 },
      clusterRadius: { value: 0.4, min: 0, max: 2, step: 0.01 },
      heightMin: { value: 0.3, min: 0, max: 2, step: 0.01 },
      heightMax: { value: 0.7, min: 0, max: 2, step: 0.01 },
      widthMin: { value: 0.08, min: 0, max: 1, step: 0.005 },
      widthMax: { value: 0.18, min: 0, max: 1, step: 0.005 },
      windSpeed: { value: 0.4, min: 0, max: 2, step: 0.01 },
      windSize: { value: 0.3, min: 0.1, max: 5, step: 0.01 },
      windDisplacement: { value: 0.4, min: 0, max: 2, step: 0.01 },
      upBias: { value: 1.5, min: 0, max: 3, step: 0.01 },
      colorA: { value: "#a3ceb7" },
      colorB: { value: "#90baa3" },
      baseDarkness: { value: 0.7, min: 0, max: 1, step: 0.01 },
      colorSamples: { value: 4, min: 2, max: 10, step: 1 },
    },
    { collapsed: true }
  )

  const scale = scaleProp ?? ctrl.scale
  const samples = samplesProp ?? ctrl.samples
  const offsetAlongNormal = offsetAlongNormalProp ?? ctrl.offsetAlongNormal
  const bladesPerPoint = bladesPerPointProp ?? ctrl.bladesPerPoint
  const clusterRadius = clusterRadiusProp ?? ctrl.clusterRadius
  const heightMin = heightMinProp ?? ctrl.heightMin
  const heightMax = heightMaxProp ?? ctrl.heightMax
  const widthMin = widthMinProp ?? ctrl.widthMin
  const widthMax = widthMaxProp ?? ctrl.widthMax
  const windSpeed = windSpeedProp ?? ctrl.windSpeed
  const windSize = windSizeProp ?? ctrl.windSize
  const windDisplacement = windDisplacementProp ?? ctrl.windDisplacement
  const upBias = upBiasProp ?? ctrl.upBias
  const colorA = colorAProp ?? ctrl.colorA
  const colorB = colorBProp ?? ctrl.colorB
  const baseDarkness = baseDarknessProp ?? ctrl.baseDarkness
  const colorSamples = colorSamplesProp ?? ctrl.colorSamples

  // Build a point cloud geometry (positions + normals) sampled on the given surface
  const sampledGeometry = useMemo(() => {
    if (!geometry) return null
    // Ensure a non-indexed geometry for consistent sampling
    const src = geometry.index ? geometry.toNonIndexed() : geometry

    // Build a temporary mesh for the sampler; apply provided object's transform if any
    const tempMesh = new THREE.Mesh(src)
    tempMesh.matrixAutoUpdate = false
    if (object) {
      object.updateWorldMatrix?.(true, true)
      tempMesh.matrix.copy(object.matrixWorld)
      // Ensure sampler sees correct world transform
      // @ts-ignore
      tempMesh.matrixWorld.copy(object.matrixWorld)
    } else {
      tempMesh.matrix.identity()
      // @ts-ignore
      tempMesh.matrixWorld.identity()
    }
    const sampler = new MeshSurfaceSampler(tempMesh).build()

    const pos = new Float32Array(samples * 3)
    const nrm = new Float32Array(samples * 3)

    const p = new THREE.Vector3()
    const n = new THREE.Vector3()
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(
      // @ts-ignore
      tempMesh.matrixWorld ?? tempMesh.matrix
    )

    for (let i = 0; i < samples; i++) {
      sampler.sample(p, n)
      // Ensure normals reflect world-space orientation
      n.applyMatrix3(normalMatrix).normalize()
      // Flip normals that face downward so offset always goes "outwards"/upward-ish
      if (n.y < 0) n.multiplyScalar(-1)
      // Move position into world space
      // @ts-ignore
      p.applyMatrix4(tempMesh.matrixWorld ?? tempMesh.matrix)
      // Add a tiny offset along normal to avoid z-fighting with the source surface
      if (offsetAlongNormal !== 0) {
        p.addScaledVector(n, offsetAlongNormal)
      }
      const o = i * 3
      pos[o + 0] = p.x
      pos[o + 1] = p.y
      pos[o + 2] = p.z
      nrm[o + 0] = n.x
      nrm[o + 1] = n.y
      nrm[o + 2] = n.z
    }

    const pts = new THREE.BufferGeometry()
    pts.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    pts.setAttribute("normal", new THREE.BufferAttribute(nrm, 3))
    return pts
  }, [geometry, object, samples, offsetAlongNormal])

  // Feed sampled points into the grass generator (produces actual blade triangles + animation node)
  const grassOutput = useMemo(() => {
    if (!sampledGeometry) return null
    return grass({
      geometry: sampledGeometry,
      windSpeed,
      windSize,
      windDisplacement,
      upBias,
      bladesPerPoint,
      clusterRadius,
      heightVariation: {
        min: heightMin ?? 0.3,
        max: heightMax ?? 0.7,
      },
      widthVariation: {
        min: widthMin ?? 0.08,
        max: widthMax ?? 0.18,
      },
      colorA,
      colorB,
      baseDarkness,
      colorSamples,
    })
  }, [
    sampledGeometry,
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
  ])

  if (!grassOutput) return null
  const { geometry: fullGrassGeometry, positionNode } = grassOutput
  fullGrassGeometry.computeBoundingBox()
  fullGrassGeometry.computeBoundingSphere()

  // Compute world-space center to use as pivot for scaling
  const worldCenter = useMemo(() => {
    const c = new THREE.Vector3()
    if (object) {
      try {
        object.updateWorldMatrix?.(true, true)
        const box = new THREE.Box3().setFromObject(object as THREE.Object3D)
        box.getCenter(c)
        return c
      } catch {
        // fallback below
      }
    }
    if (sampledGeometry) {
      const g = sampledGeometry
      g.computeBoundingBox()
      g.boundingBox?.getCenter(c)
    }
    return c
  }, [object, sampledGeometry])

  // Scale should pivot around full geometry center (X, Y, Z)
  const centerOffset = useMemo(() => new THREE.Vector3(-worldCenter.x, -worldCenter.y, -worldCenter.z), [worldCenter])

  return (
    <group position={worldCenter} scale={0.98}>
      <mesh
        ref={meshRef}
        geometry={fullGrassGeometry}
        position={centerOffset}
        // castShadow={castShadow}
        receiveShadow={receiveShadow}
        frustumCulled={false}
      >
        {/* Uses TSL NodeMaterial to animate and billboard blades */}
        <meshStandardNodeMaterial positionNode={positionNode} vertexColors side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
