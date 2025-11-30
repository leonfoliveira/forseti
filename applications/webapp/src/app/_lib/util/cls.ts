/**
 * Utility function to join class names removing invalid values.
 *
 * @param classes - An array of class names which may include falsey values.
 * @returns A single string of valid class names separated by spaces.
 */
export function cls(...classes: (string | false | undefined | null)[]): string {
  return classes.filter((c) => !!c && c.length > 0).join(" ");
}
