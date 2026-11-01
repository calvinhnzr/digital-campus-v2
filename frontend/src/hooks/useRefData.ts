import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { path } from "@/store/base"
import { groupChildren } from "@/utils/helpers/groupChildren"

export const useRefData = () => {
  const refCompressed = useGLTF(`${path}/references/ref-lights-compressed.glb`)
  const groupedRefs = useMemo(() => groupChildren(refCompressed), [refCompressed])

  return {
    lightsPlaza: groupedRefs["ref-lights-plaza"],
    lightsParking: groupedRefs["ref-lights-parking"],
  }
}
