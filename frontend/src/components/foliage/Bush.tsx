import { useMemo, forwardRef } from "react"
import { useLoader, useThree } from "@react-three/fiber"
import { useControls } from "leva"
import * as THREE from "three"

import { mulberry32 } from "@/utils/helpers/mulberry32"
import { path } from "@/store/base"
// Hook for loading textures
function useBushTextures() {
  const alphaMap = useLoader(THREE.TextureLoader, `${path}/textures/foliage/leaves.png`)
  return { alphaMap }
}

// Define props interface for BushGeometry
interface BushGeometryProps {
  planeCount?: number
  seed?: number
}

// Geometry as a subcomponent
export const BushGeometry = forwardRef<THREE.BufferGeometry, BushGeometryProps>(function BushGeometry(
  { planeCount = 90, seed = Math.random() },
  ref
) {
  const rand = useMemo(() => mulberry32(seed), [seed])

  const { positions, normals, indices, uvs } = useMemo(() => {
    const positions: number[] = []
    const normals: number[] = []
    const indices: number[] = []
    const uvs: number[] = []
    let indexOffset = 0

    const basePlane = new THREE.PlaneGeometry(1, 1)
    const basePositions = basePlane.attributes.position.array as Float32Array
    const baseIndices = basePlane.index?.array as Uint16Array
    const baseUVs = basePlane.attributes.uv.array as Float32Array

    for (let i = 0; i < planeCount; i++) {
      // position planes randomly on a sphere
      const sphereArgs = {
        radius: 1 - Math.pow(rand(), 3),
        phi: Math.PI * 2 * rand(),
        theta: Math.PI * rand(),
      }
      const sphere = new THREE.Spherical(sphereArgs.radius, sphereArgs.phi, sphereArgs.theta)
      const position = new THREE.Vector3().setFromSpherical(sphere)
      const rot = new THREE.Euler(rand() * 9999, rand() * 9999, rand() * 9999)
      const normal = position.clone().normalize()

      // normals
      for (let j = 0; j < basePositions.length; j += 3) {
        const local = new THREE.Vector3(basePositions[j], basePositions[j + 1], basePositions[j + 2])
        local.applyEuler(rot)
        local.add(position)
        positions.push(local.x, local.y, local.z)
        const mixedNormal = local.clone().lerp(normal, 0.4).normalize()
        normals.push(mixedNormal.x, mixedNormal.y, mixedNormal.z)
        const uvIndex = (j / 3) * 2
        uvs.push(baseUVs[uvIndex], baseUVs[uvIndex + 1])
      }
      for (let k = 0; k < baseIndices.length; k++) {
        indices.push(baseIndices[k] + indexOffset)
      }
      indexOffset += basePositions.length / 3
    }
    return { positions, normals, indices, uvs }
  }, [planeCount, rand])

  return (
    <bufferGeometry ref={ref}>
      <bufferAttribute
        attach="attributes-position"
        array={new Float32Array(positions)}
        count={positions.length / 3}
        itemSize={3}
      />
      <bufferAttribute
        attach="attributes-normal"
        array={new Float32Array(normals)}
        count={normals.length / 3}
        itemSize={3}
      />
      <bufferAttribute attach="attributes-uv" array={new Float32Array(uvs)} count={uvs.length / 2} itemSize={2} />
      <bufferAttribute attach="index" array={new Uint32Array(indices)} count={indices.length} itemSize={1} />
    </bufferGeometry>
  )
})

export function BushMaterial({
  materialType = "standard",
  color = "#ffffff",
  alphaMap = useBushTextures().alphaMap,
  alphaTest = 0.55,
  transparent = true,
}) {
  if (materialType === "standard") {
    return <meshStandardMaterial color={color} alphaMap={alphaMap} transparent={transparent} alphaTest={alphaTest} />
  }
  return <meshNormalMaterial />
}

export function Bush({ color: propColor }: { color?: string }) {
  const { materialType, alphaTest, transparent } = useControls("Bush", {
    materialType: {
      options: { Standard: "standard", Normal: "normal" },
      value: "standard",
    },
    alphaTest: { value: 0.55, min: 0, max: 1, step: 0.01 },
    transparent: true,
  })

  const { alphaMap } = useBushTextures()
  const color = propColor ?? "#f00"
  const seed = useMemo(() => Math.random(), [])

  return (
    <mesh castShadow receiveShadow>
      <BushGeometry planeCount={120} seed={seed} />
      <BushMaterial color={color} alphaMap={alphaMap} alphaTest={alphaTest} transparent={transparent} />
    </mesh>
  )
}
