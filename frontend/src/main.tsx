import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"

import "@/styles/reset.css"
import "@/styles/index.css"

import App from "./App.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/campus" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
