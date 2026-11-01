/**
 * Generates an array of shades for a given color.
 * @param color - The base color in hex format (e.g., "#3498db").
 * @param count - Number of shades to generate.
 * @param invert - Optional. If true, returns the array of shades in reverse order.
 * @param step - Optional. Lightness difference between each shade (in percent, e.g., 5).
 * @param range - Optional. Custom range for lightness as [min, max] (e.g., [10, 90]).
 * @returns Array of hex color strings representing the shades.
 */
export function generateColorShades(
  color: string,
  count: number,
  invert?: boolean,
  step?: number,
  range?: [number, number]
): string[] {
  // Convert hex to HSL
  function hexToHSL(hex: string): { h: number; s: number; l: number } {
    let r = 0,
      g = 0,
      b = 0
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16)
      g = parseInt(hex[2] + hex[2], 16)
      b = parseInt(hex[3] + hex[3], 16)
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16)
      g = parseInt(hex[3] + hex[4], 16)
      b = parseInt(hex[5] + hex[6], 16)
    }
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  // Convert HSL to hex
  function hslToHex(h: number, s: number, l: number): string {
    s /= 100
    l /= 100
    const k = (n: number) => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1))
    return (
      "#" +
      [f(0), f(8), f(4)]
        .map((x) =>
          Math.round(x * 255)
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
    )
  }

  const baseHSL = hexToHSL(color)
  const shades: string[] = []
  let minL = 10,
    maxL = 90
  if (range) {
    minL = range[0]
    maxL = range[1]
  }
  let lightnessStep = step !== undefined ? step : (maxL - minL) / (count - 1)
  for (let i = 0; i < count; i++) {
    const l = maxL - lightnessStep * i
    shades.push(hslToHex(baseHSL.h, baseHSL.s, l))
  }
  return invert ? shades.reverse() : shades
}
