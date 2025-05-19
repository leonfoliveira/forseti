export function cls(...classes: (string | undefined | null)[]) {
  return classes.filter((c) => c != null && c.length > 0).join(" ");
}
