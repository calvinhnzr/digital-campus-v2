// @ts-nocheck
import { useThree, useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { useEffect, useRef } from "react"
import * as THREE from "three/webgpu"
import { CSMShadowNode } from "three/examples/jsm/csm/CSMShadowNode.js"
import { CSMHelper } from "three/examples/jsm/csm/CSMHelper.js"

export function CSMManager() {
  const { scene, camera, gl } = useThree()
  const csmRef = useRef<any>(null)
  const csmHelperRef = useRef<any>(null)
  const dirLightRef = useRef<THREE.DirectionalLight>(null)

  // Leva controls for CSM parameters
  const params = useControls("CSM", {
    orthographic: false,
    fade: false,
    shadows: true,
    maxFar: { value: 1000, min: 1, max: 5000, step: 1 },
    mode: { options: ["uniform", "logarithmic", "practical"], value: "practical" },
    lightX: { value: -1, min: -1, max: 1, step: 0.01 },
    lightY: { value: -1, min: -1, max: 1, step: 0.01 },
    lightZ: { value: -1, min: -1, max: 1, step: 0.01 },
    margin: { value: 100, min: 0, max: 200, step: 1 },
    shadowNear: { value: 1, min: 1, max: 10000, step: 1 },
    shadowFar: { value: 2000, min: 1, max: 10000, step: 1 },
    helperVisible: false,
    autoUpdateHelper: true,
  })

  // Setup CSM and helper - wait for camera to be ready
  useEffect(() => {
    // Check if camera is ready first
    const isValidCamera =
      camera &&
      (camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera) &&
      camera.projectionMatrix &&
      camera.projectionMatrix.elements &&
      camera.projectionMatrix.elements.some((v) => v !== 0)

    if (!isValidCamera) return // Don't create CSM until camera is ready

    // Directional light for CSM
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.0)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = params.shadowNear
    dirLight.shadow.camera.far = params.shadowFar
    dirLight.shadow.camera.top = 1000
    dirLight.shadow.camera.bottom = -1000
    dirLight.shadow.camera.left = -1000
    dirLight.shadow.camera.right = 1000
    dirLight.shadow.bias = -0.001
    dirLight.position.set(params.lightX, params.lightY, params.lightZ).normalize().multiplyScalar(-200)
    scene.add(dirLight)
    dirLightRef.current = dirLight

    // CSM - now with valid camera
    const csm = new CSMShadowNode(dirLight, {
      cascades: 4,
      maxFar: params.maxFar,
      mode: params.mode,
      camera: camera, // Pass camera during initialization
    })
    dirLight.shadow.shadowNode = csm
    csmRef.current = csm

    // Helper
    const csmHelper = new CSMHelper(csm)
    csmHelper.visible = params.helperVisible
    scene.add(csmHelper)
    csmHelperRef.current = csmHelper

    return () => {
      scene.remove(dirLight)
      scene.remove(csmHelper)
      csm.dispose?.()
    }
  }, [
    scene,
    camera,
    params.maxFar,
    params.mode,
    params.helperVisible,
    params.shadowNear,
    params.shadowFar,
    params.lightX,
    params.lightY,
    params.lightZ,
  ])

  // Reactively update CSM and light on params change
  useEffect(() => {
    if (!dirLightRef.current || !csmRef.current) return

    dirLightRef.current.position.set(params.lightX, params.lightY, params.lightZ).normalize().multiplyScalar(-200)
    dirLightRef.current.castShadow = params.shadows
    dirLightRef.current.shadow.camera.near = params.shadowNear
    dirLightRef.current.shadow.camera.far = params.shadowFar
    dirLightRef.current.shadow.camera.updateProjectionMatrix()
    csmRef.current.maxFar = params.maxFar
    csmRef.current.mode = params.mode
    csmRef.current.lightMargin = params.margin

    // No need to set camera here since it's set during initialization
    if (csmHelperRef.current) csmHelperRef.current.visible = params.helperVisible
  }, [params])

  // Update CSM and helper every frame
  useFrame(() => {
    if (params.autoUpdateHelper && csmHelperRef.current) csmHelperRef.current.update()
    // Remove this line - CSMShadowNode doesn't need manual updates
    // if (csmRef.current) csmRef.current.update()
  })

  return null
}
