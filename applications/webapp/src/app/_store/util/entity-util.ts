/**
 * Merges an entity into an array based on its ID.
 * If an entity with the same ID exists, it is replaced; otherwise, the new entity is added.
 *
 * @param array - The array of entities to merge into.
 * @param item - The entity to merge.
 * @returns A new array with the merged entity.
 */
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
