export interface FilterItem {
  label: string
  icon?: React.ReactNode
  type?: string
  subItems: SubItem[]
}

export interface SubItem {
  label: string
  longLabel?: string // Optional long-form label shown when collapsed
  icon?: React.ReactNode
  id?: string // Optional unique identifier for the subitem
}

export type FilterCategory =
  | "area"
  | "weekly"
  | "room"
  | "toggle"
  | "clear"
  | "floor"
  | "accessible"
  | "special"
  | "living"
  | "institution"

export interface HoveredState {
  list: FilterCategory
  idx: number
}
