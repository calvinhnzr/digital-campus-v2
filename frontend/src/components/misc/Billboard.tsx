import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

// Text Facing Camera, but locked to Y axis (no pitch/roll)
export function Billboard({ children, position }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      // Get camera's Y rotation only
      const euler = new THREE.Euler(0, state.camera.rotation.y, 0)
      ref.current.quaternion.setFromEuler(euler)
    }
  })
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}
