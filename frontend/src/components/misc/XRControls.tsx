import React, { useRef } from "react"
import { XR, createXRStore, XROrigin, useXRControllerLocomotion } from "@react-three/xr"

const XRLocomotion = ({ originRef }) => {
  useXRControllerLocomotion(originRef, { speed: 4 }, { type: "smooth", speed: -3 })
  return null
}

const XRControls = ({ children, store }) => {
  const originRef = useRef(null)

  return (
    <XR store={store}>
      <XROrigin ref={originRef} />
      <XRLocomotion originRef={originRef} />
      {children}
    </XR>
  )
}

export default XRControls
