export function merge<TEntity extends { id: string }>(
  entities: TEntity[],
  entity: TEntity,
): TEntity[] {
  const existingIndex = entities.findIndex((e) => e.id === entity.id);

  if (existingIndex !== -1) {
    return entities.map((e, index) => (index === existingIndex ? entity : e));
  } else {
    return [...entities, entity];
  }
}
