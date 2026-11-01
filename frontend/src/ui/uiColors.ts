// UI COLOR SYSTEM
// Centralized color palette for all UI modes (default, glass, flat)

/**
 * Helper function to convert hex color to rgba
 * @param hex - Hex color string (e.g., "#2a1f1a")
 * @param alpha - Alpha value (0-1)
 * @returns rgba string (e.g., "rgba(42, 31, 26, 0.6)")
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Primitive color palette - raw color values used across the UI
const colors = {
  // Browns (backgrounds)
  brown_darkest: "#2a1f1a",
  brown_darker: "#2b2420",
  brown_dark: "#3d2f24",
  brown_medium: "#453528",
  brown_light: "#4a3a2e",

  // Browns (borders)
  brown_border_dark: "#3a3028",
  brown_border: "#4a3428",
  brown_border_medium: "#5a4132",
  brown_border_light: "#6a4f3d",

  // Oranges (active/hover states)
  orange_light: "#c9723f",
  orange: "#d17a4a",
  orange_warm: "#c96c3d",
  orange_bright: "#e89563",

  // Peach/Coral (text)
  peach: "#ffb896",
  cream: "#fffaf5",
  cream_light: "#fff5e6",

  // Muted tones
  gray_brown: "#7a6a5a",
  gray_warm: "#887766",
  tan: "#9a7a66",

  // Additional glass mode colors
  orange_coral: "#ff7f50", // coral-ish orange for hover states
  orange_medium: "#ff8c50", // medium orange
  orange_hover: "#ff8c42", // bright hover orange

  // Shadow colors (for inset shadows)
  shadow_orange: "#ff8c64", // orange tint for shadows
  shadow_orange_light: "#ffb482", // lighter orange for shadows
  shadow_peach: "#ffdcb4", // peachy highlight for insets
  shadow_warm: "#c9724a", // warm shadow tone
  black: "#000000",
}

// Base color palette (shared across modes)
const baseColors = {
  // Backgrounds
  listBackground: colors.brown_darkest,
  itemBackground: colors.brown_dark,
  itemBackgroundHover: colors.orange_light,
  itemBackgroundActive: colors.orange,
  itemBackgroundChecked: colors.orange_warm,
  itemBackgroundDisabled: colors.brown_darker,
  subListBackground: colors.brown_darkest,
  subItemBackground: colors.brown_medium,
  subItemBackgroundHover: colors.orange,
  subItemBackgroundChecked: colors.orange_warm,
  searchBackground: colors.brown_dark,
  searchBackgroundFocus: colors.brown_medium,
  searchBackgroundHover: colors.brown_light,

  // Borders
  listBorder: colors.brown_border,
  itemBorder: colors.brown_border_medium,
  itemBorderActive: colors.orange_bright,
  itemBorderChecked: colors.orange_bright,
  itemBorderDisabled: colors.brown_border_dark,
  subListBorder: colors.brown_border,
  subItemBorder: colors.brown_border_light,
  subItemBorderHover: colors.orange_bright,
  subItemBorderChecked: colors.orange_bright,
  searchBorder: colors.brown_border_medium,
  searchBorderFocus: colors.orange_bright,
  searchBorderHover: colors.brown_border_light,

  // Text Colors
  textPrimary: colors.peach,
  textSecondary: colors.cream,
  textDisabled: colors.gray_brown,
  textPlaceholder: colors.tan,
  textHover: colors.cream,

  // Shadows
  boxShadow: `0px 8px 32px ${hexToRgba(colors.black, 0.5)}, inset 0px 2px 8px ${hexToRgba(colors.shadow_orange, 0.08)}`,
  boxShadowItem: `0px 4px 16px ${hexToRgba(colors.black, 0.4)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_orange_light, 0.12)}`,
  boxShadowActive: `0px 8px 28px ${hexToRgba(colors.orange, 0.6)}, inset 0px 2px 6px ${hexToRgba(colors.shadow_peach, 0.2)}`,
  boxShadowChecked: `0px 6px 20px ${hexToRgba(colors.orange_warm, 0.5)}, inset 0px 2px 6px ${hexToRgba(colors.shadow_peach, 0.18)}`,
  boxShadowSubItem: `0px 3px 12px ${hexToRgba(colors.black, 0.4)}, inset 0px 1px 3px ${hexToRgba(colors.shadow_orange_light, 0.12)}`,
  boxShadowSubItemHover: `0px 5px 16px ${hexToRgba(colors.orange, 0.5)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_peach, 0.18)}`,
  boxShadowSubList: `0px 8px 24px ${hexToRgba(colors.black, 0.5)}, inset 0px 2px 6px ${hexToRgba(colors.shadow_orange_light, 0.1)}`,
  boxShadowSearch: `0px 4px 16px ${hexToRgba(colors.black, 0.4)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_orange_light, 0.12)}`,
  boxShadowSearchFocus: `0px 6px 20px ${hexToRgba(colors.orange, 0.4)}, inset 0px 2px 6px ${hexToRgba(colors.shadow_peach, 0.18)}`,
  textShadow: `0px 1px 4px ${hexToRgba(colors.black, 0.4)}`,

  // Border Widths
  borderWidth: "2px",
}

export const uiColors = {
  // Default Mode Colors (Cozy Autumn Look) - inherits all from base
  default: {
    ...baseColors,
  },

  // Glass Mode Colors (Transparent with Blur) - overrides backgrounds, borders, and shadows
  glass: {
    // Inherit text colors from base
    textPrimary: baseColors.textPrimary,
    textPlaceholder: baseColors.textPlaceholder,

    // Override backgrounds with transparency
    listBackground: hexToRgba(colors.brown_darkest, 0.6),
    itemBackground: hexToRgba(colors.brown_dark, 0.8),
    itemBackgroundHover: hexToRgba(colors.orange_coral, 0.25),
    itemBackgroundActive: hexToRgba(colors.orange_medium, 0.45),
    itemBackgroundChecked: hexToRgba(colors.orange_warm, 0.6),
    itemBackgroundDisabled: hexToRgba(colors.brown_darker, 0.6),
    subListBackground: hexToRgba(colors.brown_darkest, 0.7),
    subItemBackground: hexToRgba(colors.brown_medium, 0.85),
    subItemBackgroundHover: hexToRgba(colors.orange_medium, 0.5),
    subItemBackgroundChecked: hexToRgba(colors.orange_warm, 0.6),
    searchBackground: hexToRgba(colors.brown_dark, 0.8),
    searchBackgroundFocus: hexToRgba(colors.brown_medium, 0.9),
    searchBackgroundHover: hexToRgba(colors.brown_light, 0.85),

    // Override borders with transparency
    listBorder: hexToRgba(colors.orange_bright, 0.15),
    itemBorder: hexToRgba(colors.orange_bright, 0.25),
    itemBorderActive: hexToRgba(colors.orange_bright, 0.65),
    itemBorderChecked: hexToRgba(colors.orange_bright, 0.75),
    itemBorderDisabled: hexToRgba(colors.brown_border_dark, 0.15),
    subListBorder: hexToRgba(colors.orange_bright, 0.2),
    subItemBorder: hexToRgba(colors.orange_bright, 0.3),
    subItemBorderHover: hexToRgba(colors.orange_bright, 0.6),
    subItemBorderChecked: hexToRgba(colors.orange_bright, 0.75),
    searchBorder: hexToRgba(colors.orange_bright, 0.25),
    searchBorderFocus: hexToRgba(colors.orange_bright, 0.5),
    searchBorderHover: hexToRgba(colors.orange_bright, 0.35),

    // Override text colors (slightly different from base)
    textSecondary: colors.cream_light,
    textDisabled: colors.gray_warm,
    textHover: colors.orange_hover,

    // Override shadows (lighter)
    boxShadow: `0px 8px 32px ${hexToRgba(colors.black, 0.4)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_orange, 0.05)}`,
    boxShadowItem: `0px 4px 16px ${hexToRgba(colors.black, 0.3)}, inset 0px 1px 2px ${hexToRgba(colors.shadow_orange, 0.1)}`,
    boxShadowActive: `0px 8px 28px ${hexToRgba(colors.orange_coral, 0.5)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_peach, 0.15)}`,
    boxShadowChecked: `0px 6px 20px ${hexToRgba(colors.orange_medium, 0.4)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_peach, 0.15)}`,
    boxShadowSubItem: `0px 3px 12px ${hexToRgba(colors.black, 0.4)}, inset 0px 1px 2px ${hexToRgba(colors.shadow_orange, 0.1)}`,
    boxShadowSubItemHover: `0px 5px 16px ${hexToRgba(colors.orange_coral, 0.3)}, inset 0px 1px 3px ${hexToRgba(colors.shadow_peach, 0.15)}`,
    boxShadowSubList: `0px 8px 24px ${hexToRgba(colors.black, 0.4)}, inset 0px 2px 4px ${hexToRgba(colors.shadow_orange, 0.08)}`,
    boxShadowSearch: `0px 4px 16px ${hexToRgba(colors.black, 0.3)}, inset 0px 1px 2px ${hexToRgba(colors.shadow_orange, 0.1)}`,
    boxShadowSearchFocus: `0px 6px 20px ${hexToRgba(colors.shadow_warm, 0.3)}, inset 0px 2px 5px ${hexToRgba(colors.shadow_peach, 0.15)}`,
    textShadow: baseColors.textShadow,

    // Override border width
    borderWidth: "1.5px",

    // Add backdrop filters (glass-specific)
    backdropBlur: "blur(12px)",
    backdropBlurItem: "blur(10px)",
  },

  // Flat Mode Colors (No Shadows, No Borders) - inherits backgrounds and text from base
  flat: {
    // Inherit backgrounds from base (solid colors)
    ...baseColors,

    // Override all borders to transparent
    listBorder: "transparent",
    itemBorder: "transparent",
    itemBorderActive: "transparent",
    itemBorderChecked: "transparent",
    itemBorderDisabled: "transparent",
    subListBorder: "transparent",
    subItemBorder: "transparent",
    subItemBorderHover: "transparent",
    subItemBorderChecked: "transparent",
    searchBorder: "transparent",
    searchBorderFocus: "transparent",
    searchBorderHover: "transparent",

    // Override all shadows to none
    boxShadow: "none",
    boxShadowItem: "none",
    boxShadowActive: "none",
    boxShadowChecked: "none",
    boxShadowSubItem: "none",
    boxShadowSubItemHover: "none",
    boxShadowSubList: "none",
    boxShadowSearch: "none",
    boxShadowSearchFocus: "none",
    textShadow: "none",

    // Override border width
    borderWidth: "0px",

    // No backdrop filters
    backdropBlur: "none",
    backdropBlurItem: "none",
  },
}
