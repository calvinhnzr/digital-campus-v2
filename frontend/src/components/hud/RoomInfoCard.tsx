import React, { useMemo } from "react"
import styled from "@emotion/styled"
import dbData from "@/db/db.json"
import { roomTypes } from "@/data/rooms"

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

const Card = styled.div<{ animate?: boolean }>`
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  transform: translate(0, -50%);
  min-width: 200px;
  max-width: 280px;
  font-size: 0.875rem;
  color: #333;
  animation: ${(p) => (p.animate === false ? "none" : "popIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both")};

  @keyframes popIn {
    0% {
      opacity: 0;
      transform: translate(0, -50%) scale(0.9);
    }
    60% {
      opacity: 1;
      transform: translate(0, -50%) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translate(0, -50%) scale(1);
    }
  }
`

const RoomNumber = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #e63946;
  margin-bottom: 0.5rem;
`

const Title = styled.div`
  font-weight: 600;
  color: #1d3557;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Type = styled.div`
  display: inline-block;
  background: #f1faee;
  color: #457b9d;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const People = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
`

const PersonName = styled.div`
  font-size: 0.8rem;
  color: #333;
  margin-bottom: 0.25rem;

  span {
    font-weight: 600;
  }
`

const NoData = styled.div`
  color: #999;
  font-style: italic;
  font-size: 0.8rem;
`

interface RoomInfoCardProps {
  roomNumber: string
  animate?: boolean
}

export const RoomInfoCard: React.FC<RoomInfoCardProps> = ({ roomNumber, animate = true }) => {
  const roomData = useMemo(() => {
    const room = (dbData.rooms as Room[]).find((r) => r.roomnumber.includes(roomNumber))
    if (!room) return null

    // Get room type label
    const roomType = roomTypes.find((rt) => rt.id === room.type)

    // Get people details
    const people = room.people
      .map((personId) => (dbData.people as Person[]).find((p) => p.id === personId))
      .filter(Boolean) as Person[]

    // Get institution details
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
      <Card animate={animate}>
        <RoomNumber>{roomNumber}</RoomNumber>
        <NoData>No data available</NoData>
      </Card>
    )
  }

  return (
    <Card animate={animate}>
      <RoomNumber>{roomNumber}</RoomNumber>

      {roomData.title && <Title>{roomData.title}</Title>}

      <Type>{roomData.typeLabel}</Type>

      {roomData.people.length > 0 && (
        <People>
          <Label>People</Label>
          {roomData.people.map((person, idx) => (
            <PersonName key={idx}>
              <span>
                {person.title} {person.firstName} {person.lastName}
              </span>
              {person.position && ` · ${person.position}`}
            </PersonName>
          ))}
        </People>
      )}

      {roomData.institution && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#666" }}>{roomData.institution.name}</div>
      )}
    </Card>
  )
}
