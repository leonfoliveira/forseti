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

/**
 * Merges multiple entities into an array based on their IDs.
 * If an entity with the same ID exists, it is replaced; otherwise, the new entity is added.
 *
 * @param array - The array of entities to merge into.
 * @param items - The entities to merge.
 * @returns A new array with the merged entities.
 */
export function mergeEntityBatch<T extends { id: string }>(
  array: T[],
  items: T[],
): T[] {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const mergedArray = array.map((e) => itemMap.get(e.id) ?? e);
  const newItems = items.filter((item) => !array.some((e) => e.id === item.id));
  return [...mergedArray, ...newItems];
}
