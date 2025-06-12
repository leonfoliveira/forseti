export function cls(...classes: (string | false | undefined | null)[]) {
  return classes.filter((c) => !!c && c.length > 0).join(" ");
}
