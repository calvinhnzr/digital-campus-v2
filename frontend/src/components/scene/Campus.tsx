import { useGLTF } from "@react-three/drei"

import { path } from "@/store/base"
import CustomMesh from "@/components/misc/CustomMesh"

const Campus = () => {
  const campusDraco = useGLTF(`${path}/models/campus/campus_draco.glb`)
  // const campusDraco = useGLTF(`${path}/models/campus/campus-compressed.glb`)

  return (
    <>
      <CustomMesh model={campusDraco} castShadow receiveShadow />
    </>
  )
}

export default Campus
