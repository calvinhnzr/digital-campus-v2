import React, { use, useEffect, useState, useRef } from "react"
import SceneWebGPU from "@/components/SceneWebGPU"

import { Leva, useControls, folder, button } from "leva"
import { useNavigate, useLocation } from "react-router" // update import
import { Layout } from "@/ui/Layout"

const isDebugMode = () => window.location.hash === "#debug"

function App() {
  const {} = useControls(
    "App",
    {
      Fullscreen: button(() => {
        const elem = document.documentElement
        if (!document.fullscreenElement) {
          elem.requestFullscreen?.()
        } else {
          document.exitFullscreen?.()
        }
      }),
    },
    { collapsed: true }
  )

  const [debugMode, setDebugMode] = useState(isDebugMode())

  // Listen for hash changes to toggle debug mode
  useEffect(() => {
    const handleHashChange = () => setDebugMode(isDebugMode())
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        const elem = document.documentElement
        if (!document.fullscreenElement) {
          elem.requestFullscreen?.()
        } else {
          document.exitFullscreen?.()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <a href="https://github.com/calvinhnzr" className="social" target="_blank" rel="noopener noreferrer">
        {" "}
        GitHub
      </a>
      <Leva collapsed hidden={!debugMode} />
      <Layout />
      <SceneWebGPU />
    </>
  )
}

export default App
