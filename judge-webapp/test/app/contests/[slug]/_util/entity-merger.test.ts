describe("merge", () => {
  interface TestEntity {
    id: string;
    name: string;
  }

  const merge = (entities: TestEntity[], entity: TestEntity): TestEntity[] => {
    const existingIndex = entities.findIndex((e) => e.id === entity.id);
    if (existingIndex !== -1) {
      return entities.map((e, index) => (index === existingIndex ? entity : e));
    } else {
      return [...entities, entity];
    }
  };

  it("should add a new entity if it does not exist", () => {
    const entities: TestEntity[] = [{ id: "1", name: "Entity 1" }];
    const newEntity: TestEntity = { id: "2", name: "Entity 2" };
    const result = merge(entities, newEntity);
    expect(result).toEqual([...entities, newEntity]);
  });

  it("should update an existing entity", () => {
    const entities: TestEntity[] = [
      { id: "1", name: "Entity 1" },
      { id: "2", name: "Entity 2" },
    ];
    const updatedEntity: TestEntity = { id: "1", name: "Updated Entity 1" };
    const result = merge(entities, updatedEntity);
    expect(result).toEqual([updatedEntity, entities[1]]);
  });

  it("should handle empty arrays", () => {
    const entities: TestEntity[] = [];
    const newEntity: TestEntity = { id: "1", name: "New Entity" };
    const result = merge(entities, newEntity);
    expect(result).toEqual([newEntity]);
  });

  it("should not modify the original array", () => {
    const entities: TestEntity[] = [{ id: "1", name: "Original Entity" }];
    const newEntity: TestEntity = { id: "2", name: "New Entity" };
    const result = merge(entities, newEntity);
    expect(result).not.toBe(entities);
    expect(result).toEqual([...entities, newEntity]);
  });
});
