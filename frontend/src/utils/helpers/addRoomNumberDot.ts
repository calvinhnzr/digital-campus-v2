export const addRoomNumberDot = (str) => {
  if (str && str.length > 1) {
    return str.substring(0, 1) + "." + str.substring(1)
  }
  return str
}
