import dbData from "@/db/db.json"

interface Room {
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

export interface RoomType {
  id: string
  label: string
  icon: string
}

// Export all room types from db.json
export const roomTypes: RoomType[] = dbData.roomTypes as RoomType[]

// Helper function to get all room numbers for a specific type
export const getRoomNumbersByType = (type: string): string[] => {
  return (dbData.rooms as Room[]).filter((room) => room.type === type).flatMap((room) => room.roomnumber)
}

// Helper to find a room's type by room number
export const getRoomTypeByNumber = (roomNumber: string): RoomType | undefined => {
  const room = (dbData.rooms as Room[]).find((r) => r.roomnumber.includes(roomNumber))
  if (!room) return undefined
  return roomTypes.find((rt) => rt.id === room.type)
}

// Helper function to get all room numbers for a specific subtype
export const getRoomNumbersBySubtype = (subtype: string): string[] => {
  return (dbData.rooms as Room[]).filter((room) => room.subtype === subtype).flatMap((room) => room.roomnumber)
}

// Helper function to get all room numbers for a specific institution
export const getRoomNumbersByInstitution = (institutionId: string): string[] => {
  return (dbData.rooms as Room[])
    .filter((room) => room.institution === institutionId)
    .flatMap((room) => room.roomnumber)
}

// Build a map of type -> room numbers for all types
export const roomsByType: Record<string, string[]> = Object.fromEntries(
  roomTypes.map((rt) => [rt.id, getRoomNumbersByType(rt.id)])
)

// Resolve a filter value to room numbers (supports "type", "subtype:value", and "institution:id")
export const getRoomNumbersForFilter = (filter: string): string[] => {
  if (filter.startsWith("subtype:")) {
    return getRoomNumbersBySubtype(filter.slice("subtype:".length))
  }
  if (filter.startsWith("institution:")) {
    return getRoomNumbersByInstitution(filter.slice("institution:".length))
  }
  return roomsByType[filter] || []
}

// Legacy named exports for backward compatibility
export const misc: string[] = getRoomNumbersByType("misc")
export const service: string[] = getRoomNumbersByType("service")
export const study: string[] = getRoomNumbersByType("study")
export const lab: string[] = getRoomNumbersByType("lab")
export const lecture: string[] = getRoomNumbersByType("lecture")
export const seminar: string[] = getRoomNumbersByType("seminar")
export const kitchen: string[] = getRoomNumbersByType("kitchen")
export const office: string[] = getRoomNumbersByType("office")
export const restroom: string[] = getRoomNumbersByType("restroom")
export const technic: string[] = getRoomNumbersByType("technic")
