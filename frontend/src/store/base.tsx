import * as THREE from "three"

export const path = import.meta.env.VITE_PATH
export const WORLD_CENTER = new THREE.Vector3(100, 0, 20)

const bg_color_blue = "#6093d5"
const bg_color_blue_dark = "#4c647a"

const lightIntensity = 4.51
const ambientIntensity = 1.218

const colorHighlight = "#3f4b59"
// const colorHighlight = "#dfc0a5"

export const colors = {
  highlightLayer: colorHighlight,
  roomTypes: {
    lecture: "#b25151",
    seminar: "#6f81a1",
    lab: "#597a59",
    office: "#8f659f",
    restroom: "",
    other: "",
  },
}

const seasons = {
  default: {
    backgroundColor: bg_color_blue,
    lightIntensity: 3.0,
    ambientIntensity: 1.4,
    lightColor: "#ffd6bf",
    grassColor: "#5cde96",
    tree1Color: "#81dba9",
    tree2Color: "#b2ffa3",
    colorAGrass: "#81dba9",
    colorBGrass: "#b2ffa3",
  },
  autumn: {
    backgroundColor: "#ffb393",
    lightIntensity: 4.5,
    ambientIntensity: 1.22,
    lightColor: "#ff9151",
    grassColor: "#d89b81",
    tree1Color: "#e5956d",
    tree2Color: "#efc0a6",
    colorAGrass: "#db9981",
    colorBGrass: "#ffc2a3",
  },
  winter: {
    backgroundColor: "#a3c1d9",
    lightIntensity: 3.8,
    ambientIntensity: 1.1,
    lightColor: "#e0f0ff",
    grassColor: "#c4d6e1",
    tree1Color: "#d0e2f0",
    tree2Color: "#e6f0f8",
    colorAGrass: "#c4d6e1",
    colorBGrass: "#e6f0f8",
  },
  spring: {
    backgroundColor: "#E7E7E7",
    lightIntensity: 4.2,
    ambientIntensity: 1.2,
    lightColor: "#fff5e1",
    grassColor: "#a8e6a1",
    tree1Color: "#86dbab",
    tree2Color: "#8bff89",
    colorAGrass: "#a8e6a1",
    colorBGrass: "#d0f0c4",
  },
}

export const defaultSettings = seasons.spring

// TH Köln Color Palette
const th_color_red = "#CF1820"
const th_color_orange = "#EC6525"
const th_color_purple = "#AF368C"

// Amazing Bomberman Color Palette
const bm_color_yellow = "#ffca81"
const bm_color_yellow_light = "#dfc5a4"
const bm_color_orange = "#e59872"
const bm_color_blue_night = "#2b3756"
const bm_color_gray_dark = "#4c5869"
const bm_color_gray = "#626f82"
const bm_color_red = "#cd4d4d"
const bm_color_green = "#81ad97"
const bm_color_green_light = "#a8c6ba"

// Blueprints Color Palette
const bp_color_blue = "#3057E1"
const bp_color_blue_pale = "#4A6DE5"
const bp_color_blue_light = "#CED8F7"
const bp_color_blue_dark = "#002082"

// EXPORTS
export const base_color_black = "#000000"
export const base_color_white = "#FFFFFF"
export const base_color_background = bg_color_blue
// export const base_color_background = bp_color_blue_pale
export const base_color_accent = bp_color_blue_light

// SPACING
export const GAP_EXPLOSION = 10 //rem
