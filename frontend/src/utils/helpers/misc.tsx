// --- Helper function for extracting roomIDs from a mesh click ---
// read stored metadata on vertices
export function getRoomIDsFromFace(event) {
  const mesh = event.object
  const geometry = mesh.geometry
  const index = geometry.index
  const roomIDAttr = geometry.attributes["_roomid"]

  if (index && roomIDAttr && event.faceIndex !== undefined) {
    // Each face is 3 indices (triangle)
    const i = event.faceIndex * 3
    const a = index.array[i]
    const b = index.array[i + 1]
    const c = index.array[i + 2]

    // Get roomID for each vertex of the face
    const roomIDA = roomIDAttr.getX(a)
    const roomIDB = roomIDAttr.getX(b)
    const roomIDC = roomIDAttr.getX(c)

    return [roomIDA, roomIDB, roomIDC]
  }
  return null
}
