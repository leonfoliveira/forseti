/**
 * Utility class for color-related functions.
 */
export class ColorUtil {
  /**
   * Generates a random hex color code.
   *
   * @returns A random hex color code in the format "#rrggbb".
   */
  static getRandom(): string {
    const letters = "0123456789abcdef";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Determines whether black or white text would be more readable on a given background color.
   *
   * @param hex - The background color in hex format (e.g., "#rrggbb").
   * @returns The hex code for the foreground color ("#000000" for black or "#FFFFFF" for white).
   */
  static getForegroundColor(hex: string): string {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    // Calculate the brightness of the background color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black for light backgrounds and white for dark backgrounds
    return brightness > 128 ? "#000000" : "#FFFFFF";
  }
}
