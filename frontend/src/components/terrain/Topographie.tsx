// @ts-nocheck

import React, { useEffect, useMemo, useState, useRef } from "react"
import * as THREE from "three"
import * as TSL from "three/tsl"
import { Fn, positionLocal } from "three/tsl"

import { useLoader } from "@react-three/fiber"
import { Center, Clone, Stage, useGLTF } from "@react-three/drei"
import { useControls } from "leva"

import { path } from "@/store/base"
import { CSMManager } from "./CSMManager"

const vertexShader = Fn(() => {
  const gl_Position = TSL.modelViewProjection.mul(positionLocal)
  return gl_Position
})

const fragmentShader = Fn(() => {
  // const p = TSL.vec4(1.0, 0.0, 0.0, 1.0)
  const p = TSL.color("magenta")
  return p
})

function Topographie() {
  const displacementMap = useLoader(THREE.TextureLoader, `${path}/textures/displacement/gm-11.png`)

  const terrain = import.meta.glob("@/dtm/*/*.png")

  // console.log(bumpMap)
  // const dsmData = useGLTF("./elevation/DSM-data.glb")
  // const dtmData = useGLTF("./elevation/DTM-data.glb")
  const dtmData10x10 = useGLTF(`${path}/elevation/DTM-data-reduced.glb`)

  const { showDTM10x10, size, subdivision, position, displacementScale, displacementBias, wireframe, color } =
    useControls(
      "⛰️ Topographie",
      {
        // showDSM: false,
        // showDTM: false,
        showDTM10x10: true,
        size: { value: 1000, min: 1, max: 1000, step: 1 },
        subdivision: { value: 100, min: 1, max: 100, step: 1 },
        position: { value: [0, 0, 0], step: 0.1 },
        displacementScale: { value: 100, min: -100, max: 100 },
        displacementBias: { value: 0, min: -1, max: 1 },
        wireframe: false,
        color: { value: "#81dba9" },
      },
      { collapsed: true }
    )

  return (
    <>
      {/* <CSMManager /> */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={position} castShadow receiveShadow>
          <planeGeometry args={[size, size, subdivision, subdivision]} />
          <meshStandardNodeMaterial
            displacementScale={displacementScale}
            displacementMap={displacementMap}
            displacementBias={displacementBias}
            colorNode={fragmentShader()}
            positionNode={null}
            color={color}
            wireframe={wireframe}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* {showDSM && <primitive object={dsmData.scene} />} */}
      {/* {showDTM && <primitive object={dtmData.scene} />} */}
      {/* {showDTM10x10 && <ModelWithEdges model={dtmData10x10} />} */}
      {/* {showDTM10x10 && <primitive object={dtmData10x10.scene} />} */}
      {/* {showDTM10x10 && <primitive object={terrainTest.scene} />} */}
      {/* 
      <group visible={showDTM10x10}>
        <mesh
          rotation={terrainTest.scene.children[0].rotation}
          position={terrainTest.scene.children[0].position}
          scale={terrainTest.scene.children[0].scale}
          geometry={terrainTest.scene.children[0].geometry}
          receiveShadow
        >
          <meshStandardMaterial color={color} side={THREE.DoubleSide} wireframe={wireframe} />
        </mesh>
      </group> */}

      {/* <primitive object={parkingLotTerrain.scene} /> */}

      {/* <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={position} castShadow receiveShadow>
        <planeGeometry args={[size, size, subdivision, subdivision]} />
        <meshStandardMaterial
          displacementScale={displacementScale}
          displacementMap={displacementMap}
          displacementBias={displacementBias}
          color={color}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      </mesh> */}
      {/* <primitive object={plazaFloor.scene} /> */}
      {/* <mesh scale={10} rotation={[-Math.PI / 2, 0, 0]} position={position} castShadow receiveShadow>
        <planeGeometry args={[size, size, subdivision, subdivision]} />
        <meshStandardMaterial bumpScale={bumpScale} bumpMap={bumpMap} color="#81dba9" wireframe={wireframe} />
      </mesh> */}
    </>
  )
}

export default Topographie
