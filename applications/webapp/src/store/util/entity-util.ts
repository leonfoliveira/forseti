export function mergeEntity<T extends { id: string }>(
  array: T[],
  item: T,
): T[] {
  const existingIndex = array.findIndex((e) => e.id === item.id);

  if (existingIndex !== -1) {
    return array.map((e, index) => (index === existingIndex ? item : e));
  } else {
    return [...array, item];
  }
}
