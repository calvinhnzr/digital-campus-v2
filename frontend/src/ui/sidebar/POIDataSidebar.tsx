import React, { useState, useEffect } from "react"
import { useAtom } from "jotai"
import { poiDataSidebarOpenAtom, selectedPoiIdAtom } from "@/store/atom"
import "./RoomDataSidebar.css"

// POI types
const POI_TYPES = ["locker", "vending-machine", "printer", "info-point", "other"]

interface POIFormData {
  id: string
  name: string
  poiType: string
  description: string
  areaNumber: string
}

const initialFormData: POIFormData = {
  id: "",
  name: "",
  poiType: "",
  description: "",
  areaNumber: "",
}

const POIDataSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(poiDataSidebarOpenAtom)
  const [selectedPoiId, setSelectedPoiId] = useAtom(selectedPoiIdAtom)
  const [formData, setFormData] = useState<POIFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allPOIs, setAllPOIs] = useState<POIFormData[]>([])
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Fetch existing POIs
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const response = await fetch("http://localhost:3000/poi")
        if (response.ok) {
          const pois = await response.json()
          setAllPOIs(pois)
        }
      } catch (error) {
        console.log("Could not fetch POI data")
      }
    }
    if (isOpen) {
      fetchPOIs()
    }
  }, [isOpen])

  // Load POI data if editing existing POI
  useEffect(() => {
    if (selectedPoiId && isOpen) {
      const existingPOI = allPOIs.find((poi) => poi.id === selectedPoiId)
      if (existingPOI) {
        setFormData(existingPOI)
      } else {
        // New POI
        setFormData({ ...initialFormData, id: selectedPoiId })
      }
    }
  }, [selectedPoiId, isOpen, allPOIs])

  const handleClose = () => {
    setIsOpen(false)
    setSelectedPoiId("")
    setFormData(initialFormData)
    setSubmitMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Check if POI already exists
      const existingPOI = allPOIs.find((poi) => poi.id === formData.id)

      const method = existingPOI ? "PUT" : "POST"
      const url = existingPOI ? `http://localhost:3000/poi/${formData.id}` : "http://localhost:3000/poi"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitMessage({ type: "success", text: existingPOI ? "POI updated!" : "POI created!" })
        setTimeout(() => setSubmitMessage(null), 3000)
        // Refresh POI list
        const allResponse = await fetch("http://localhost:3000/poi")
        if (allResponse.ok) {
          setAllPOIs(await allResponse.json())
        }
      } else {
        setSubmitMessage({ type: "error", text: "Failed to save POI" })
      }
    } catch (error) {
      setSubmitMessage({ type: "error", text: "Network error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.id || !confirm("Delete this POI?")) return

    try {
      const response = await fetch(`http://localhost:3000/poi/${formData.id}`, { method: "DELETE" })
      if (response.ok) {
        setSubmitMessage({ type: "success", text: "POI deleted!" })
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setSubmitMessage({ type: "error", text: "Failed to delete POI" })
      }
    } catch (error) {
      setSubmitMessage({ type: "error", text: "Network error" })
    }
  }

  return (
    <>
      <button className={`sidebar-toggle poi-toggle ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        POI
      </button>

      <div className={`room-data-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>POI Data</h2>
          <button onClick={handleClose}>✕</button>
        </div>

        <form className="sidebar-form" onSubmit={handleSubmit}>
          {submitMessage && <div className={`submit-message ${submitMessage.type}`}>{submitMessage.text}</div>}

          <div className="form-group">
            <label htmlFor="poi-id">POI ID</label>
            <input
              id="poi-id"
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="poi-b03-f01-locker-01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="poi-name">Name</label>
            <input
              id="poi-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Locker Room 1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="poi-type">Type</label>
            <select
              id="poi-type"
              value={formData.poiType}
              onChange={(e) => setFormData({ ...formData, poiType: e.target.value })}
              required
            >
              <option value="">Select type...</option>
              {POI_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="poi-area">Area Number</label>
            <input
              id="poi-area"
              type="text"
              value={formData.areaNumber}
              onChange={(e) => setFormData({ ...formData, areaNumber: e.target.value })}
              placeholder="b03-f01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="poi-description">Description</label>
            <textarea
              id="poi-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional information about this POI..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save POI"}
            </button>
            {allPOIs.find((poi) => poi.id === formData.id) && (
              <button type="button" onClick={handleDelete} className="delete-button">
                Delete
              </button>
            )}
          </div>
        </form>

        <div className="sidebar-footer">
          <h3>All POIs ({allPOIs.length})</h3>
          <div className="poi-list">
            {allPOIs.map((poi) => (
              <div
                key={poi.id}
                className={`poi-item ${poi.id === selectedPoiId ? "active" : ""}`}
                onClick={() => {
                  setSelectedPoiId(poi.id)
                  setFormData(poi)
                }}
              >
                <strong>{poi.name}</strong>
                <span>
                  {poi.poiType} {poi.areaNumber && `• ${poi.areaNumber}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default POIDataSidebar
