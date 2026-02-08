import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditionally joining classNames together.
 * It uses clsx to handle the logic of combining class names and
 * twMerge to optimize the final string by merging Tailwind CSS classes.
 *
 * @param inputs - An array of class values to be combined.
 * @returns A single string with merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
