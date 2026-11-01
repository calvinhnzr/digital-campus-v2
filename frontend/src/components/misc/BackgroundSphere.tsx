import * as THREE from "three"
import { useClickHandler } from "@/hooks/useClickHandler"

{
  /* Background Sphere to catch clicks outside of rooms */
}
const BackgroundSphere = () => {
  const { handleBackgroundClick, handleBackgroundPointerDown } = useClickHandler()
  const radius = 500
  const size = 16

  return (
    <mesh position={[0, 0, -10]} onPointerDown={handleBackgroundPointerDown} onClick={handleBackgroundClick}>
      {/* <planeGeometry args={[10000, 10000]} /> */}
      <sphereGeometry args={[radius, size, size]} />
      <meshBasicMaterial
        //
        transparent
        color={"red"}
        opacity={0}
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  )
}

export default BackgroundSphere
