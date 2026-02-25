/**
 * Merges an entity into an array based on its ID.
 * If an entity with the same ID exists, it is replaced; otherwise, the new entity is added.
 *
 * @param array - The array of entities to merge into.
 * @param item - The entity to merge.
 * @returns A new array with the merged entity.
 */
export function mergeEntity<T extends { id: string; version: number }>(
  array: T[] | undefined,
  item: T,
): T[] {
  const existingEntity = array?.find((e) => e.id === item.id);

  if (existingEntity && existingEntity.version < item.version) {
    return (array || []).map((e) => (e.id === item.id ? item : e));
  } else if (!existingEntity) {
    return array ? [...array, item] : [item];
  } else {
    return array || [];
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
export function mergeEntityBatch<T extends { id: string; version: number }>(
  array: T[] | undefined,
  items: T[],
): T[] {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const mergedArray =
    array?.map((e) => {
      const newItem = itemMap.get(e.id);
      return newItem && newItem.version > e.version ? newItem : e;
    }) || [];
  const newItems = items.filter(
    (item) => !array?.some((e) => e.id === item.id),
  );
  return [...mergedArray, ...newItems];
}
