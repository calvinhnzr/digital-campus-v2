import { use, useState } from "react"
import * as THREE from "three/webgpu"
import { Canvas, extend, type ThreeToJSXElements, useFrame, useThree } from "@react-three/fiber"

import Experience from "@/components/scene/Experience"
import { Stats } from "@react-three/drei"

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}
extend(THREE as any)

const SceneWebGPU = () => {
  return (
    <>
      <Canvas
        id="webgpu-canvas"
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer({
            ...(props as unknown as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
            antialias: true,
            forceWebGL: false,
            alpha: true,
            // sortObjects: true,
            // autodepth: false,
          })

          await renderer.init()
          return renderer
        }}
      >
        <Experience />
      </Canvas>
    </>
  )
}

export default SceneWebGPU
