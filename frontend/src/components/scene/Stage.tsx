import { useControls, folder } from "leva"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"

import DirectionalLightControls from "@/components/lighting/DirectionalLightControls"
import CameraSearchAnimation from "@/components/camera/CameraSearchAnimation"

import { path, defaultSettings, WORLD_CENTER } from "@/store/base"

const Stage = () => {
  const { showBackground, backgroundColor, environmentIntensity } = useControls(
    "🌅 Stage",
    {
      showBackground: { value: false, label: "Env Background" },
      backgroundColor: { value: defaultSettings.backgroundColor, label: "Background Color" },
      environmentIntensity: { value: 1, min: 0, max: 5, step: 0.1, label: "Env Intensity" },
    },
    { collapsed: true }
  )

  const cameraControls = useControls(
    "📹 Camera",
    {
      "Perspective Camera": folder(
        {
          perspectivePosition: { value: [30, 90, 200], min: -100, max: 100, step: 1, label: "Position" },
          fov: { value: 75, min: 10, max: 120, step: 1, label: "FOV" },
          perspectiveNear: { value: 0.1, min: 0.01, max: 10, step: 0.01, label: "Near" },
          perspectiveFar: { value: 1000, min: 100, max: 5000, step: 10, label: "Far" },
        },
        { collapsed: true }
      ),
    },
    { collapsed: true }
  )

  return (
    <>
      <DirectionalLightControls />
      <color attach="background" args={[backgroundColor]} />
      <OrbitControls
        makeDefault
        maxPolarAngle={75 * (Math.PI / 180)} // Prevent looking below (45 degrees max)
        minDistance={90} // Minimum zoom distance
        maxDistance={250} // Maximum zoom distance
        enablePan={false} // Disable panning to prevent moving the scene
        target={WORLD_CENTER} // Shift orbit center to the right
      />
      <CameraSearchAnimation />
      <PerspectiveCamera
        makeDefault
        position={cameraControls.perspectivePosition}
        fov={cameraControls.fov}
        near={cameraControls.perspectiveNear}
        far={cameraControls.perspectiveFar}
      />
    </>
  )
}

export default Stage
