/**
 * Generates a random hex color code
 * @returns A random hex color string in format "#RRGGBB"
 */
export const generateRandomHexColor = (): string => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Generates a random hex color code with specific brightness constraints
 * @param minBrightness Minimum brightness value (0-255)
 * @param maxBrightness Maximum brightness value (0-255)
 * @returns A random hex color string within brightness constraints
 */
export const generateRandomHexColorWithBrightness = (
  minBrightness: number = 0,
  maxBrightness: number = 255
): string => {
  let color: string
  let brightness: number

  do {
    color = generateRandomHexColor()
    // Convert hex to RGB and calculate brightness
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    brightness = (r + g + b) / 3
  } while (brightness < minBrightness || brightness > maxBrightness)

  return color
}