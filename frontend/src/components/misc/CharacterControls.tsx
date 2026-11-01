import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { KeyboardControls, CameraControls } from "@react-three/drei"
import { useControls } from "leva"
import BVHEcctrl, { StaticCollider, useEcctrlStore, type BVHEcctrlApi, type StoreState } from "bvhecctrl"
import { useGLTF } from "@react-three/drei"
import { path } from "@/store/base"
import CustomMesh from "@/utils/three/CustomMesh"

const CharacterControls = () => {
  const ghost = useGLTF(`${path}/cute_ghost.glb`)
  console.log("Ghost model loaded:", ghost)

  const ecctrlRef = useRef<BVHEcctrlApi | null>(null)
  const camControlRef = useRef<CameraControls | null>(null)
  const colliderMeshesArray = useEcctrlStore((state: StoreState) => state.colliderMeshesArray)

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ]

  // Helper to simulate keyboard events for BVHEcctrl
  const simulateKey = (key: string, type: "keydown" | "keyup") => {
    window.dispatchEvent(new KeyboardEvent(type, { code: key }))
  }

  // Track pressed states to avoid repeat events
  const pressed = useRef<{ [key: string]: boolean }>({})

  // Add rotation state
  const [boxRotation, setBoxRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)
  // @ts-ignore
  const meshRef = useRef<THREE.Mesh>(null)

  // Add direction mapping
  const directionAngles: Record<string, number> = {
    up: 0,
    right: -Math.PI / 2,
    down: Math.PI,
    left: Math.PI / 2,
  }

  // Leva control for jumpVel
  const { jumpVel } = useControls("🟧 Cube Controls", {
    jumpVel: { value: 10, min: 5, max: 50, step: 1, label: "Jump Velocity" },
  })

  useFrame(() => {
    // Camera follow character pos
    if (ecctrlRef.current && ecctrlRef.current.group && camControlRef.current)
      camControlRef.current.moveTo(
        ecctrlRef.current.group.position.x,
        ecctrlRef.current.group.position.y + 0.3,
        ecctrlRef.current.group.position.z,
        true
      )

    // Gamepad logic
    const gamepads = navigator.getGamepads?.() || []
    const gp = gamepads[0]
    if (gp) {
      // Left stick: movement
      const threshold = 0.2
      const up = gp.axes[1] < -threshold
      const down = gp.axes[1] > threshold
      const left = gp.axes[0] < -threshold
      const right = gp.axes[0] > threshold
      const run = gp.buttons[0]?.pressed // A button for run (keep as is)
      const jump = gp.buttons[0]?.pressed || gp.buttons[1]?.pressed // A or B button for jump

      // Map to keyboard codes
      const mapping = [
        { active: up, code: "KeyW" },
        { active: down, code: "KeyS" },
        { active: left, code: "KeyA" },
        { active: right, code: "KeyD" },
        { active: run, code: "ShiftLeft" },
        { active: jump, code: "Space" }, // A or B triggers jump
      ]

      mapping.forEach(({ active, code }) => {
        if (active && !pressed.current[code]) {
          simulateKey(code, "keydown")
          pressed.current[code] = true
        } else if (!active && pressed.current[code]) {
          simulateKey(code, "keyup")
          pressed.current[code] = false
        }
      })

      // Right stick: camera orbit
      const rightX = gp.axes[2] || 0
      const rightY = gp.axes[3] || 0
      const cameraThreshold = 0.1
      const cameraSpeed = 0.03 // Adjust for sensitivity

      if (camControlRef.current) {
        if (Math.abs(rightX) > cameraThreshold || Math.abs(rightY) > cameraThreshold) {
          camControlRef.current.rotate(-rightX * cameraSpeed, -rightY * cameraSpeed, true)
        }

        // Triggers: zoom
        const rt = gp.buttons[7]?.value || 0 // Right Trigger
        const lt = gp.buttons[6]?.value || 0 // Left Trigger
        const zoomSpeed = 0.2 // Adjust for sensitivity

        if (rt > 0.1) {
          camControlRef.current.dolly(rt * zoomSpeed, true) // Zoom in
        }
        if (lt > 0.1) {
          camControlRef.current.dolly(-lt * zoomSpeed, true) // Zoom out
        }
      }

      // Determine movement direction
      let moveDir: string | null = null
      if (up) moveDir = "up"
      else if (right) moveDir = "right"
      else if (down) moveDir = "down"
      else if (left) moveDir = "left"

      // Set target rotation based on direction
      if (moveDir) {
        setTargetRotation(directionAngles[moveDir])
      }

      // Smoothly interpolate current rotation toward target
      setBoxRotation((prev) => {
        let diff = targetRotation - prev
        // Keep rotation in [-PI, PI] range for shortest path
        if (diff > Math.PI) diff -= 2 * Math.PI
        if (diff < -Math.PI) diff += 2 * Math.PI
        const step = 0.15
        if (Math.abs(diff) < 0.01) return targetRotation
        return prev + Math.sign(diff) * Math.min(Math.abs(diff), step)
      })
    } else {
      // Release all if no gamepad
      Object.keys(pressed.current).forEach((code) => {
        if (pressed.current[code]) {
          simulateKey(code, "keyup")
          pressed.current[code] = false
        }
      })
    }

    // Apply rotation to mesh
    if (meshRef.current) {
      meshRef.current.rotation.y = boxRotation
    }
  })

  return (
    <>
      <CameraControls ref={camControlRef} smoothTime={0.1} makeDefault />
      <KeyboardControls map={keyboardMap}>
        <BVHEcctrl
          gravity={9.81}
          maxWalkSpeed={20}
          maxRunSpeed={20}
          floatSpringK={120}
          floatDampingC={14}
          jumpVel={jumpVel} // <-- Use Leva value here
          ref={ecctrlRef}
        >
          <CustomMesh model={ghost} scale={[0.7, 0.7, 0.7]} />
          {/* <mesh ref={meshRef} castShadow receiveShadow visible={true}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh> */}
        </BVHEcctrl>
      </KeyboardControls>
    </>
  )
}

export default CharacterControls
