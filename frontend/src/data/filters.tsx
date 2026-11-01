import { FilterItem } from "@/types/filter"
import { roomTypes } from "@/data/rooms"
import {
  FaDoorOpen,
  FaDoorClosed,
  FaBicycle,
  FaCar,
  FaParking,
  FaWheelchair,
  FaRestroom,
  FaBook,
  FaBriefcase,
  FaBuilding,
  FaUtensils,
  FaCoffee,
  FaEnvelope,
  FaGamepad,
  FaTools,
  FaMale,
  FaFemale,
  FaIdCard,
  FaPaperPlane,
  FaDice,
  FaChalkboardTeacher,
  FaChalkboard,
  FaHome,
  FaBeer,
  FaShoppingBasket,
  FaMapMarkerAlt,
  FaUserShield,
  FaBaby,
  FaLock,
} from "react-icons/fa"
import {
  FaComputer,
  FaElevator,
  FaStairs,
  FaCircleInfo,
  FaPrint,
  FaBottleWater,
  FaCookieBite,
  FaUpDown,
  FaCalendarWeek,
  FaUniversalAccess,
  FaFlask,
  FaCircleQuestion,
  FaRegSquare,
  FaCalendarXmark,
  FaBed,
  FaBasketball,
  FaBaseballBatBall,
  FaPencil,
  FaSquareParking,
  FaMugHot,
  FaKitchenSet,
  FaBagShopping,
} from "react-icons/fa6"

import { MdElevator, MdDoorSliding } from "react-icons/md"

// Map icon string names from db.json to actual React icon components
export const iconMap: Record<string, React.ReactNode> = {
  FaChalkboardTeacher: <FaChalkboardTeacher />,
  FaChalkboard: <FaChalkboard />,
  FaFlask: <FaFlask />,
  FaBook: <FaBook />,
  FaCircleInfo: <FaCircleInfo />,
  FaCoffee: <FaCoffee />,
  FaBriefcase: <FaBriefcase />,
  FaRestroom: <FaRestroom />,
  FaCircleQuestion: <FaCircleQuestion />,
  FaTools: <FaTools />,
}

// Map subtype filter values to their icons
export const subtypeIconMap: Record<string, React.ReactNode> = {
  "subtype:restroom-men": <FaMale />,
  "subtype:restroom-women": <FaFemale />,
  "subtype:restroom-all-gender": <FaRestroom />,
  "subtype:restroom-accessible": <FaWheelchair />,
  "subtype:first-aid, baby-changing": <FaBaby />,
}

// Get the icon for a filter value (type ID or subtype:xxx)
export const getFilterIcon = (filterValue: string): React.ReactNode => {
  // Check subtypes first
  if (filterValue.startsWith("subtype:")) {
    return subtypeIconMap[filterValue] || <FaCircleQuestion />
  }
  // Find the room type and return its icon
  const rt = roomTypes.find((r) => r.id === filterValue)
  if (rt) {
    return iconMap[rt.icon] || <FaCircleQuestion />
  }
  return <FaCircleQuestion />
}

// Room type IDs to show in the filter UI.
// Comment out or remove entries to hide them from the filter.
const visibleRoomTypes: string[] = [
  "lecture",
  "seminar",
  "lab",
  "study",
  "service",
  "kitchen",
  // "office",
  "restroom",
  // "misc",
  // "technic",
]

// Generate room filters dynamically from db.json roomTypes, filtered by visibleRoomTypes
export const roomFilters: FilterItem[] = roomTypes
  .filter((rt) => visibleRoomTypes.includes(rt.id))
  .map((rt) => ({
    label: rt.id,
    icon: iconMap[rt.icon] || <FaCircleQuestion />,
    type: "radio",
    subItems: [],
  }))

export const areaFilters: FilterItem[] = [
  // {
  //   label: "buildings",
  //   icon: <FaBuilding />,
  //   subItems: [
  //     { label: "1", icon: <FaBuilding /> },
  //     { label: "2", icon: <FaBuilding /> },
  //     { label: "3", icon: <FaBuilding /> },
  //     { label: "4", icon: <FaBuilding /> },
  //     { label: "library", icon: <FaBook /> },
  //   ],
  // },
  {
    label: "parking",
    icon: <FaSquareParking />,
    subItems: [
      { label: "car", icon: <FaCar /> },
      { label: "employees", icon: <FaCar /> },
      { label: "disabled", icon: <FaWheelchair /> },
      { label: "bike", icon: <FaBicycle /> },
    ],
  },
  {
    label: "entrances",
    icon: <FaDoorOpen />,
    subItems: [
      { label: "entrances", icon: <FaDoorOpen /> },
      { label: "exits", icon: <FaDoorClosed /> },
      { label: "automatic doors", icon: <MdDoorSliding /> },
    ],
  },

  {
    label: "dining",
    icon: <FaUtensils />,
    subItems: [
      { label: "cafeteria", icon: <FaUtensils /> },
      { label: "vending-machine", icon: <FaBottleWater /> },
      // { label: "snack-machine", icon: <FaCookieBite /> },
      { label: "coffee-bar", icon: <FaMugHot /> },
    ],
  },

  {
    label: "organization",
    icon: <FaPencil />,
    subItems: [
      // { label: "GMID-CENTER", icon: <FaUserShield /> },
      { label: "validating", icon: <FaIdCard /> },
      { label: "mail", icon: <FaEnvelope /> },
      { label: "printer", icon: <FaPrint /> },
      { label: "Computer", icon: <FaComputer /> },
      { label: "locker", icon: <FaBagShopping />, id: "poi:locker" },
      // { label: "library", icon: <FaBook /> }, // poi via default (did you know)
      // { label: "activity", icon: <FaBaseballBatBall /> }, // poi via default
    ],
  },
  {
    label: "restrooms",
    icon: <FaRestroom />,
    subItems: [
      { label: "men", icon: <FaMale />, id: "subtype:restroom-men" },
      { label: "women", icon: <FaFemale />, id: "subtype:restroom-women" },
      { label: "gender-neutral", icon: <FaRestroom />, id: "subtype:restroom-all-gender" },
      { label: "accessible", icon: <FaWheelchair />, id: "subtype:restroom-accessible" },
      { label: "baby-changing", icon: <FaBaby />, id: "subtype:first-aid, baby-changing" },
    ],
  },
  {
    label: "elevation",
    icon: <FaUpDown />,
    subItems: [
      { label: "stairs", icon: <FaStairs /> },
      { label: "lift", icon: <MdElevator /> },
    ],
  },
]

export const livingFilters: FilterItem[] = [
  {
    label: "living in gummersbach",
    icon: <FaMapMarkerAlt />,
    subItems: [
      { label: "dorms", icon: <FaBed /> },
      { label: "social", icon: <FaBeer /> },
      { label: "shopping", icon: <FaShoppingBasket /> },
      { label: "sports", icon: <FaBasketball /> },
    ],
  },
]

export const weeklyEventFilters: FilterItem[] = [
  {
    label: "weekly events",
    icon: <FaCalendarWeek />,
    subItems: [
      { label: "maker-space", icon: <FaTools /> },
      { label: "board-games", icon: <FaDice /> },
      { label: "super-smash", icon: <FaGamepad /> },
    ],
  },
]

export const accessibilityFilters: FilterItem[] = [
  {
    label: "accessible",
    icon: <FaUniversalAccess />,
    subItems: [
      { label: "parking", icon: <FaParking /> },
      { label: "automatic doors", icon: <MdDoorSliding /> },
      { label: "ramps", icon: <FaWheelchair /> },
      { label: "lifts", icon: <MdElevator /> },
      { label: "restrooms", icon: <FaRestroom /> },
    ],
  },
]

export const specialEventFilters: FilterItem[] = [
  {
    label: "special events",
    icon: <FaCalendarXmark />,
    subItems: [
      { label: "summerfest", icon: <FaRegSquare /> },
      { label: "digital-x-change", icon: <FaRegSquare /> },
      { label: "technic-night", icon: <FaRegSquare /> },
      { label: "bbq", icon: <FaRegSquare /> },
      { label: "pub-tour", icon: <FaRegSquare /> },
      { label: "christmas", icon: <FaRegSquare /> },
      { label: "cocktail", icon: <FaRegSquare /> },
    ],
  },
]

// Institution filters - dynamically generated from db.json
import dbData from "@/db/db.json"
import { getRoomNumbersByInstitution } from "@/data/rooms"

interface Institution {
  id: string
  name: string
  abbreviation: string
  website: string
  building: string
}

export const institutionFilters: FilterItem = {
  label: "institutions",
  icon: <FaBuilding />,
  subItems: (dbData.institutions as Institution[]).map((inst) => {
    const roomCount = getRoomNumbersByInstitution(inst.id).length
    return {
      label: `${inst.abbreviation} (${roomCount})`,
      longLabel: `${inst.name} (${roomCount})`,
      icon: <FaBuilding />,
      id: `institution:${inst.id}`,
    }
  }),
}
