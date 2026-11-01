import React, { useState, useEffect } from "react"
import { useAtom } from "jotai"
import { roomDataSidebarOpenAtom, selectedRoomNumbersAtom } from "@/store/atom"
import { roomTypes } from "@/data/rooms"
import "./RoomDataSidebar.css"

// Room types from db.json
const ROOM_TYPES = roomTypes.map((rt) => rt.id)

// Common title suggestions
const TITLE_SUGGESTIONS = ["Dr.", "Prof.", "Prof. Dr.", "Mr.", "Ms.", "Dipl.-Ing."]

interface Person {
  id?: string
  title: string
  firstName: string
  lastName: string
  position: string
  institution: string
  links: string
}

interface Institution {
  id: string
  name: string
  abbreviation: string
  website: string
  building: string
}

interface RoomFormData {
  roomnumber: string[]
  title: string
  type: string
  subtype: string
  people: Person[]
  institution: string
  otherDetails: string
  links: string
}

const emptyPerson: Person = {
  title: "",
  firstName: "",
  lastName: "",
  position: "",
  institution: "",
  links: "",
}

const initialFormData: RoomFormData = {
  roomnumber: [],
  title: "",
  type: "",
  subtype: "",
  people: [],
  institution: "",
  otherDetails: "",
  links: "",
}

const RoomDataSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(roomDataSidebarOpenAtom)
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useAtom(selectedRoomNumbersAtom)
  const [formData, setFormData] = useState<RoomFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingSubtypes, setExistingSubtypes] = useState<string[]>([])
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [allPeople, setAllPeople] = useState<Person[]>([])
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([])

  // Fetch existing entries for suggestions
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const [roomsResponse, peopleResponse, institutionsResponse] = await Promise.all([
          fetch("http://localhost:3000/rooms"),
          fetch("http://localhost:3000/people"),
          fetch("http://localhost:3000/institutions"),
        ])
        if (roomsResponse.ok) {
          const rooms = await roomsResponse.json()
          setAllRooms(rooms)
          const subtypes = [...new Set(rooms.map((r: any) => r.subtype).filter(Boolean))] as string[]
          setExistingSubtypes(subtypes)
        }
        if (peopleResponse.ok) {
          const people = await peopleResponse.json()
          setAllPeople(people)
        }
        if (institutionsResponse.ok) {
          const institutions = await institutionsResponse.json()
          setAllInstitutions(institutions)
        }
      } catch (error) {
        console.log("Could not fetch existing data for suggestions")
      }
    }
    if (isOpen) {
      fetchExistingData()
    }
  }, [isOpen])
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Check if a room with the selected room number already exists and load its data
  useEffect(() => {
    const checkExistingRoom = async () => {
      if (selectedRoomNumbers.length === 0 || !isOpen) {
        return
      }

      // Look for a room that contains any of the selected room numbers
      const roomNumber = selectedRoomNumbers[selectedRoomNumbers.length - 1] // Check the most recently added
      if (!roomNumber) return

      setIsLoading(true)
      try {
        // Find room in cached data first
        const existingRoom = allRooms.find((room: any) => room.roomnumber && room.roomnumber.includes(roomNumber))

        if (existingRoom) {
          // Resolve person IDs to full person objects
          const resolvedPeople: Person[] = (existingRoom.people || []).map((personId: string) => {
            const person = allPeople.find((p) => p.id === personId)
            if (person) {
              // Resolve person's institution ID to name
              const personInstitutionName = person.institution
                ? allInstitutions.find((i) => i.id === person.institution)?.name || person.institution
                : ""
              return { ...person, institution: personInstitutionName }
            }
            // If person not found, return empty person with the ID stored
            return { ...emptyPerson, id: personId }
          })

          // Resolve institution ID to name for display
          const institutionName = existingRoom.institution
            ? allInstitutions.find((i) => i.id === existingRoom.institution)?.name || existingRoom.institution
            : ""

          // Populate form with existing data
          setFormData({
            roomnumber: existingRoom.roomnumber || [],
            title: existingRoom.title || "",
            type: existingRoom.type || "",
            subtype: existingRoom.subtype || "",
            people: resolvedPeople,
            institution: institutionName,
            otherDetails: existingRoom.otherDetails || "",
            links: existingRoom.links || "",
          })
          setSelectedRoomNumbers(existingRoom.roomnumber || [])
          setEditingRoomId(existingRoom.id)
          setSubmitMessage({ type: "success", text: `Loaded existing data for room ${roomNumber}` })
        } else {
          // No existing room found, just update room numbers
          setEditingRoomId(null)
        }
      } catch (error) {
        console.log("Error checking for existing room:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingRoom()
  }, [selectedRoomNumbers, allRooms, allPeople, allInstitutions, isOpen])

  // Update form data when selected room numbers change (only for room numbers, not full form)
  useEffect(() => {
    if (!editingRoomId) {
      setFormData((prev) => ({
        ...prev,
        roomnumber: selectedRoomNumbers,
      }))
    }
  }, [selectedRoomNumbers, editingRoomId])

  const handleInputChange = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRoomNumberChange = (index: number, value: string) => {
    const newRoomNumbers = [...formData.roomnumber]
    newRoomNumbers[index] = value
    setFormData((prev) => ({
      ...prev,
      roomnumber: newRoomNumbers,
    }))
    setSelectedRoomNumbers(newRoomNumbers)
  }

  const addRoomNumber = () => {
    const newRoomNumbers = [...formData.roomnumber, ""]
    setFormData((prev) => ({
      ...prev,
      roomnumber: newRoomNumbers,
    }))
    setSelectedRoomNumbers(newRoomNumbers)
  }

  const removeRoomNumber = (index: number) => {
    const newRoomNumbers = formData.roomnumber.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      roomnumber: newRoomNumbers,
    }))
    setSelectedRoomNumbers(newRoomNumbers)
  }

  const handlePersonChange = (personIndex: number, field: keyof Person, value: string) => {
    const newPeople = [...formData.people]
    newPeople[personIndex] = {
      ...newPeople[personIndex],
      [field]: value,
    }
    setFormData((prev) => ({
      ...prev,
      people: newPeople,
    }))
  }

  const addPerson = () => {
    setFormData((prev) => ({
      ...prev,
      people: [...prev.people, { ...emptyPerson }],
    }))
  }

  const removePerson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      people: prev.people.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.roomnumber.length === 0 || formData.roomnumber.every((r) => !r.trim())) {
      setSubmitMessage({ type: "error", text: "At least one room number is required" })
      return
    }

    if (!formData.type) {
      setSubmitMessage({ type: "error", text: "Room type is required" })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Track institutions that may be created during this operation
      let updatedAllInstitutions = [...allInstitutions]

      // Helper function to resolve institution name to ID, creating new institution if needed
      const resolveInstitutionToId = async (instName: string): Promise<string> => {
        if (!instName) return ""
        const inst = updatedAllInstitutions.find((i) => i.name === instName || i.id === instName)
        if (inst) return inst.id

        // Create new institution
        const maxInstId = updatedAllInstitutions.reduce((max, i) => {
          const num = parseInt(i.id?.replace("inst", "") || "0")
          return num > max ? num : max
        }, 0)
        const newInstId = `inst${String(maxInstId + 1).padStart(3, "0")}`
        const newInstitution: Institution = {
          id: newInstId,
          name: instName,
          abbreviation: "",
          website: "",
          building: "",
        }

        const instResponse = await fetch("http://localhost:3000/institutions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newInstitution),
        })
        if (instResponse.ok) {
          updatedAllInstitutions.push(newInstitution)
          return newInstId
        }
        return instName // Fallback to name if creation fails
      }

      // Convert person objects to IDs, creating new people entries if needed
      const personIds: string[] = []
      const updatedAllPeople = [...allPeople]

      for (const person of formData.people) {
        // Skip empty people (no name entered)
        if (!person.firstName && !person.lastName) continue

        // Convert person's institution name to ID for storage (may create new institution)
        const personForStorage = {
          ...person,
          institution: await resolveInstitutionToId(person.institution),
        }

        if (person.id) {
          // Existing person - update their data
          const existingIndex = updatedAllPeople.findIndex((p) => p.id === person.id)
          if (existingIndex >= 0) {
            updatedAllPeople[existingIndex] = { ...personForStorage }
            // Update person in database
            await fetch(`http://localhost:3000/people/${person.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(personForStorage),
            })
          }
          personIds.push(person.id)
        } else {
          // New person - check if they already exist by name
          const existingPerson = updatedAllPeople.find(
            (p) => p.firstName === person.firstName && p.lastName === person.lastName
          )
          if (existingPerson && existingPerson.id) {
            personIds.push(existingPerson.id)
          } else {
            // Create new person with next available ID
            const maxId = updatedAllPeople.reduce((max, p) => {
              const num = parseInt(p.id?.replace("p", "") || "0")
              return num > max ? num : max
            }, 0)
            const newId = `p${String(maxId + 1).padStart(3, "0")}`
            const newPerson = { ...personForStorage, id: newId }

            const response = await fetch("http://localhost:3000/people", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newPerson),
            })
            if (response.ok) {
              updatedAllPeople.push(newPerson)
              personIds.push(newId)
            }
          }
        }
      }

      setAllPeople(updatedAllPeople)

      // Resolve room institution name to ID (may create new institution)
      const institutionId = await resolveInstitutionToId(formData.institution)

      // Update institutions state with any newly created institutions
      setAllInstitutions(updatedAllInstitutions)

      // Clean up the data before sending - keep all keys in consistent order
      const payload: Record<string, any> = {
        id: editingRoomId || undefined, // Will be assigned by json-server for new entries
        roomnumber: formData.roomnumber.filter((r) => r.trim()),
        title: formData.title,
        type: formData.type,
        subtype: formData.subtype,
        people: personIds,
        institution: institutionId,
        otherDetails: formData.otherDetails,
        links: formData.links,
      }

      // Remove id if creating new entry (json-server will assign it)
      if (!editingRoomId) {
        delete payload.id
      }

      // Use PUT for updates, POST for new entries
      const url = editingRoomId ? `http://localhost:3000/rooms/${editingRoomId}` : "http://localhost:3000/rooms"
      const method = editingRoomId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const savedRoom = await response.json()

      // Update allRooms cache
      if (editingRoomId) {
        setAllRooms((prev) => prev.map((r) => (r.id === editingRoomId ? savedRoom : r)))
        setSubmitMessage({ type: "success", text: "Room data updated successfully!" })
      } else {
        setAllRooms((prev) => [...prev, savedRoom])
        setSubmitMessage({ type: "success", text: "Room data saved successfully!" })
      }

      // Reset form after successful submission
      setFormData(initialFormData)
      setSelectedRoomNumbers([])
      setEditingRoomId(null)
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setFormData(initialFormData)
    setSelectedRoomNumbers([])
    setEditingRoomId(null)
    setSubmitMessage(null)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`sidebar-toggle ${isOpen ? "open" : ""}`}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        title={isOpen ? "Close sidebar" : "Open room data form"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </>
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`room-data-sidebar ${isOpen ? "open" : ""}`}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sidebar-header">
          <h2>{editingRoomId ? "Edit Room" : "Room Data"}</h2>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        {isLoading && <div className="loading-indicator">Loading room data...</div>}

        {editingRoomId && <div className="editing-badge">Editing existing room (ID: {editingRoomId})</div>}

        <form onSubmit={handleSubmit} className="sidebar-form">
          {/* Room Numbers (Array) */}
          <div className="form-group">
            <label>
              Room Numbers <span className="required">*</span>
            </label>
            <div className="room-numbers-list">
              {formData.roomnumber.map((roomNum, index) => (
                <div key={index} className="room-number-item">
                  <input
                    type="text"
                    value={roomNum}
                    onChange={(e) => handleRoomNumberChange(index, e.target.value)}
                    placeholder="e.g., 0101"
                  />
                  <button type="button" className="remove-btn" onClick={() => removeRoomNumber(index)}>
                    −
                  </button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addRoomNumber}>
                + Add Room Number
              </button>
            </div>
            <small className="hint">Click on a room in the 3D view to add its number</small>
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Room title (optional)"
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label htmlFor="type">
              Type <span className="required">*</span>
            </label>
            <select id="type" value={formData.type} onChange={(e) => handleInputChange("type", e.target.value)}>
              <option value="">Select type...</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subtype */}
          <div className="form-group">
            <label htmlFor="subtype">Subtype</label>
            <input
              type="text"
              id="subtype"
              list="subtype-suggestions"
              value={formData.subtype}
              onChange={(e) => handleInputChange("subtype", e.target.value)}
              placeholder="e.g., restroom-men (optional)"
            />
            <datalist id="subtype-suggestions">
              {existingSubtypes.map((sub) => (
                <option key={sub} value={sub} />
              ))}
            </datalist>
            {existingSubtypes.length > 0 && (
              <small className="suggestions-hint">
                Existing: {existingSubtypes.slice(0, 3).join(", ")}
                {existingSubtypes.length > 3 ? "..." : ""}
              </small>
            )}
          </div>

          {/* People */}
          <div className="form-group">
            <label>People</label>
            <div className="people-list">
              {formData.people.map((person, index) => (
                <div key={index} className="person-item">
                  <div className="person-header">
                    <span>Person {index + 1}</span>
                    <button type="button" className="remove-btn small" onClick={() => removePerson(index)}>
                      ×
                    </button>
                  </div>
                  <div className="person-fields">
                    <div className="field-row">
                      <label>Title</label>
                      <input
                        type="text"
                        list={`title-suggestions-${index}`}
                        value={person.title}
                        onChange={(e) => handlePersonChange(index, "title", e.target.value)}
                        placeholder="e.g., Prof. Dr."
                      />
                      <datalist id={`title-suggestions-${index}`}>
                        {TITLE_SUGGESTIONS.map((title) => (
                          <option key={title} value={title} />
                        ))}
                      </datalist>
                    </div>
                    <div className="field-row">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={person.firstName}
                        onChange={(e) => handlePersonChange(index, "firstName", e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div className="field-row">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={person.lastName}
                        onChange={(e) => handlePersonChange(index, "lastName", e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div className="field-row">
                      <label>Position</label>
                      <input
                        type="text"
                        value={person.position}
                        onChange={(e) => handlePersonChange(index, "position", e.target.value)}
                        placeholder="Position"
                      />
                    </div>
                    <div className="field-row">
                      <label>Institution</label>
                      <input
                        type="text"
                        list={`person-institution-suggestions-${index}`}
                        value={person.institution}
                        onChange={(e) => handlePersonChange(index, "institution", e.target.value)}
                        placeholder="Institution"
                      />
                      <datalist id={`person-institution-suggestions-${index}`}>
                        {allInstitutions.map((inst) => (
                          <option key={inst.id} value={inst.name} />
                        ))}
                      </datalist>
                    </div>
                    <div className="field-row">
                      <label>Links</label>
                      <input
                        type="text"
                        value={person.links}
                        onChange={(e) => handlePersonChange(index, "links", e.target.value)}
                        placeholder="URL (e.g., website, profile)"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addPerson}>
                + Add Person
              </button>
            </div>
          </div>

          {/* Institution */}
          <div className="form-group">
            <label htmlFor="institution">Institution</label>
            <input
              type="text"
              id="institution"
              list="institution-suggestions"
              value={formData.institution}
              onChange={(e) => handleInputChange("institution", e.target.value)}
              placeholder="Institution name (optional)"
            />
            <datalist id="institution-suggestions">
              {allInstitutions.map((inst) => (
                <option key={inst.id} value={inst.name} />
              ))}
            </datalist>
            {allInstitutions.length > 0 && (
              <small className="suggestions-hint">
                Existing:{" "}
                {allInstitutions
                  .slice(0, 3)
                  .map((i) => i.name)
                  .join(", ")}
                {allInstitutions.length > 3 ? "..." : ""}
              </small>
            )}
          </div>

          {/* Other Details */}
          <div className="form-group">
            <label htmlFor="otherDetails">Other Details</label>
            <textarea
              id="otherDetails"
              value={formData.otherDetails}
              onChange={(e) => handleInputChange("otherDetails", e.target.value)}
              placeholder="Additional information (optional)"
              rows={3}
            />
          </div>

          {/* Links */}
          <div className="form-group">
            <label htmlFor="links">Links</label>
            <input
              type="text"
              id="links"
              value={formData.links}
              onChange={(e) => handleInputChange("links", e.target.value)}
              placeholder="URL (e.g., room info page)"
            />
          </div>

          {/* Submit Message */}
          {submitMessage && <div className={`submit-message ${submitMessage.type}`}>{submitMessage.text}</div>}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="clear-btn" onClick={handleClear}>
              Clear
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : editingRoomId ? "Update Room" : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default RoomDataSidebar
