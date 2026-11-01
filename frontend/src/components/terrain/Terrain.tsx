import * as THREE from "three"

import { useGLTF } from "@react-three/drei"

import { path, defaultSettings } from "@/store/base"

const Terrain = () => {
  const terrainModel = useGLTF(`${path}/models/terrain/terrain-compressed.glb`)
  return (
    <>
      <mesh
        //
        geometry={terrainModel.scene.children[0].geometry}
        position={terrainModel.scene.children[0].position}
        scale={terrainModel.scene.children[0].scale}
        rotation={terrainModel.scene.children[0].rotation}
      >
        <meshBasicMaterial color={defaultSettings.backgroundColor} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

export default Terrain
