import { useMemo } from "react"

// Types matching db.json schema
export interface Room {
  id: string
  roomnumber: string[]
  title: string
  type: string
  subtype: string
  people: string[]
  institution: string
  otherDetails: string
  links: string
}

export interface Person {
  id: string
  title: string
  firstName: string
  lastName: string
  position: string
  institution: string
  links: string
}

export interface Institution {
  id: string
  name: string
  abbreviation: string
  website: string
  building: string
}

export interface SearchResultItem {
  type: "room" | "person" | "roomTitle"
  room?: Room
  person?: Person
  matchedField: string
  matchedValue: string
  // For person results, include the rooms they're in
  associatedRooms?: Room[]
}

export interface SearchResults {
  roomNumbers: SearchResultItem[]
  people: SearchResultItem[]
  roomTitles: SearchResultItem[]
  totalCount: number
}

export interface DbData {
  rooms: Room[]
  people: Person[]
  institutions: Institution[]
}

// Helper to get full person name
export const getPersonFullName = (person: Person): string => {
  const parts = []
  if (person.title) parts.push(person.title)
  if (person.firstName) parts.push(person.firstName)
  if (person.lastName) parts.push(person.lastName)
  return parts.join(" ")
}

// Helper to get institution name by id
export const getInstitutionName = (institutionId: string, institutions: Institution[]): string => {
  const inst = institutions.find((i) => i.id === institutionId)
  return inst?.name || inst?.abbreviation || ""
}

// Helper to get person by id
export const getPersonById = (personId: string, people: Person[]): Person | undefined => {
  return people.find((p) => p.id === personId)
}

// Helper to get room type label
export const getRoomTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    lecture: "Lecture Hall",
    seminar: "Seminar Room",
    lab: "Laboratory",
    study: "Study Room",
    service: "Service",
    kitchen: "Kitchen",
    office: "Office",
    restroom: "Restroom",
    misc: "Miscellaneous",
    technic: "Technical Room",
  }
  return labels[type] || type
}

export const useDbSearch = (data: DbData | null, query: string, maxResults: number = 10): SearchResults => {
  return useMemo(() => {
    const emptyResult: SearchResults = {
      roomNumbers: [],
      people: [],
      roomTitles: [],
      totalCount: 0,
    }

    if (!data || !query || query.trim().length < 2) {
      return emptyResult
    }

    const searchTerm = query.toLowerCase().trim()
    const { rooms, people } = data

    const roomNumbers: SearchResultItem[] = []
    const peopleResults: SearchResultItem[] = []
    const roomTitles: SearchResultItem[] = []

    // Search by room number
    for (const room of rooms) {
      if (roomNumbers.length >= maxResults) break

      for (const roomNum of room.roomnumber) {
        if (roomNum.toLowerCase().includes(searchTerm)) {
          roomNumbers.push({
            type: "room",
            room,
            matchedField: "roomnumber",
            matchedValue: roomNum,
          })
          break
        }
      }
    }

    // Search by person name
    for (const person of people) {
      if (peopleResults.length >= maxResults) break

      const fullName = getPersonFullName(person).toLowerCase()
      const firstName = person.firstName?.toLowerCase() || ""
      const lastName = person.lastName?.toLowerCase() || ""

      if (fullName.includes(searchTerm) || firstName.includes(searchTerm) || lastName.includes(searchTerm)) {
        // Find rooms where this person works
        const associatedRooms = rooms.filter((room) => room.people.includes(person.id))

        peopleResults.push({
          type: "person",
          person,
          matchedField: "person",
          matchedValue: getPersonFullName(person),
          associatedRooms,
        })
      }
    }

    // Search by room title
    for (const room of rooms) {
      if (roomTitles.length >= maxResults) break

      if (room.title && room.title.toLowerCase().includes(searchTerm)) {
        // Check if this room wasn't already added via room number search
        const alreadyInRoomNumbers = roomNumbers.some((r) => r.room?.id === room.id)
        if (!alreadyInRoomNumbers) {
          roomTitles.push({
            type: "roomTitle",
            room,
            matchedField: "title",
            matchedValue: room.title,
          })
        }
      }
    }

    return {
      roomNumbers,
      people: peopleResults,
      roomTitles,
      totalCount: roomNumbers.length + peopleResults.length + roomTitles.length,
    }
  }, [data, query, maxResults])
}

export default useDbSearch
