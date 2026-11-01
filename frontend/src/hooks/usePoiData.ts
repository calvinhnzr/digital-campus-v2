import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { path } from "@/store/base"
import { groupChildren } from "@/utils/helpers/groupChildren"

export const usePoiData = () => {
  const poiCompressed = useGLTF(`${path}/poi/poi-compressed.glb`)
  const groupedPOIs = useMemo(() => groupChildren(poiCompressed), [poiCompressed])

  return {
    entrances: groupedPOIs["poi-entrances"],
    exits: groupedPOIs["poi-exits"],
    bike: groupedPOIs["poi-parking-bike"],
    car: groupedPOIs["poi-parking-car"],
    restricted: groupedPOIs["poi-parking-restricted"],
    disabled: groupedPOIs["poi-parking-disabled"],
  }
}
