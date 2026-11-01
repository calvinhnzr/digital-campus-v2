import React, { useMemo } from "react"
import { Html } from "@react-three/drei"
import { useAtom } from "jotai"
import dbData from "@/db/db.json"
import { roomTypes } from "@/data/rooms"
import { uiBaseColorAtom } from "@/store/atom"

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

interface Person {
  id: string
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

interface RoomInfoCard3DProps {
  roomNumber: string
  position?: [number, number, number]
}

const cardMargin = "32px"

export const RoomInfoCard3D: React.FC<RoomInfoCard3DProps> = ({ roomNumber, position = [0, 0, 0] }) => {
  const [baseColor] = useAtom(uiBaseColorAtom)
  const cardStyle = { "--ui-base": baseColor } as React.CSSProperties

  const roomData = useMemo(() => {
    const room = (dbData.rooms as Room[]).find((r) => r.roomnumber.includes(roomNumber))
    if (!room) return null

    const roomType = roomTypes.find((rt) => rt.id === room.type)

    const people = room.people
      .map((personId) => (dbData.people as Person[]).find((p) => p.id === personId))
      .filter(Boolean) as Person[]

    const institution = room.institution
      ? (dbData.institutions as Institution[]).find((i) => i.id === room.institution)
      : null

    return {
      ...room,
      typeLabel: roomType?.label || room.type,
      people,
      institution,
    }
  }, [roomNumber])

  if (!roomData) {
    return (
      <group position={position}>
        <Html style={{ transform: `translate(${cardMargin}, -50%)` }} zIndexRange={[1000, 0]}>
          <div className="room-card" style={cardStyle}>
            <div className="room-card__number">{roomNumber}</div>
            <div className="room-card__nodata">No data available</div>
          </div>
        </Html>
      </group>
    )
  }

  return (
    <group position={position}>
      <Html style={{ transform: `translate(${cardMargin}, -50%)` }} zIndexRange={[1000, 0]}>
        <div className="room-card" style={cardStyle}>
          <div className="room-card__number">{roomNumber}</div>

          {roomData.title && <div className="room-card__title">{roomData.title}</div>}

          <div className="room-card__badge">{roomData.typeLabel}</div>

          {roomData.people.length > 0 && (
            <div className="room-card__section">
              <div className="room-card__label">People</div>
              {roomData.people.map((person, idx) => (
                <div key={idx} className="room-card__person">
                  <span className="room-card__person-name">
                    {person.title} {person.firstName} {person.lastName}
                  </span>
                  {person.position && <span className="room-card__person-position">{` · ${person.position}`}</span>}
                </div>
              ))}
            </div>
          )}

          {roomData.institution && <div className="room-card__institution">{roomData.institution.name}</div>}
        </div>
      </Html>
    </group>
  )
}
