import { mergeEntity } from "@/app/_store/util/entity-util";

describe("mergeEntity", () => {
  type TestEntity = {
    id: string;
    name: string;
    value: number;
  };

  const createTestEntity = (
    id: string,
    name: string,
    value: number,
  ): TestEntity => ({
    id,
    name,
    value,
  });

  describe("when adding new entities", () => {
    it("should add a new entity to an empty array", () => {
      const array: TestEntity[] = [];
      const newEntity = createTestEntity("1", "First Entity", 100);

      const result = mergeEntity(array, newEntity);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newEntity);
    });

    it("should add a new entity to an existing array", () => {
      const array = [
        createTestEntity("1", "First Entity", 100),
        createTestEntity("2", "Second Entity", 200),
      ];
      const newEntity = createTestEntity("3", "Third Entity", 300);

      const result = mergeEntity(array, newEntity);

      expect(result).toHaveLength(3);
      expect(result[2]).toEqual(newEntity);
      expect(result[0]).toEqual(array[0]);
      expect(result[1]).toEqual(array[1]);
    });

    it("should not modify the original array when adding", () => {
      const array = [createTestEntity("1", "First Entity", 100)];
      const originalArray = [...array];
      const newEntity = createTestEntity("2", "Second Entity", 200);

      const result = mergeEntity(array, newEntity);

      expect(array).toEqual(originalArray);
      expect(result).not.toBe(array);
    });
  });

  describe("when updating existing entities", () => {
    it("should update an entity when id exists", () => {
      const array = [
        createTestEntity("1", "First Entity", 100),
        createTestEntity("2", "Second Entity", 200),
        createTestEntity("3", "Third Entity", 300),
      ];
      const updatedEntity = createTestEntity("2", "Updated Second Entity", 999);

      const result = mergeEntity(array, updatedEntity);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(array[0]);
      expect(result[1]).toEqual(updatedEntity);
      expect(result[2]).toEqual(array[2]);
    });

    it("should update the first entity when it matches", () => {
      const array = [
        createTestEntity("1", "First Entity", 100),
        createTestEntity("2", "Second Entity", 200),
      ];
      const updatedEntity = createTestEntity("1", "Updated First Entity", 555);

      const result = mergeEntity(array, updatedEntity);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(updatedEntity);
      expect(result[1]).toEqual(array[1]);
    });

    it("should update the last entity when it matches", () => {
      const array = [
        createTestEntity("1", "First Entity", 100),
        createTestEntity("2", "Second Entity", 200),
        createTestEntity("3", "Third Entity", 300),
      ];
      const updatedEntity = createTestEntity("3", "Updated Third Entity", 777);

      const result = mergeEntity(array, updatedEntity);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(array[0]);
      expect(result[1]).toEqual(array[1]);
      expect(result[2]).toEqual(updatedEntity);
    });

    it("should not modify the original array when updating", () => {
      const array = [
        createTestEntity("1", "First Entity", 100),
        createTestEntity("2", "Second Entity", 200),
      ];
      const originalArray = [...array];
      const updatedEntity = createTestEntity("1", "Updated First Entity", 555);

      const result = mergeEntity(array, updatedEntity);

      expect(array).toEqual(originalArray);
      expect(result).not.toBe(array);
    });
  });

  describe("edge cases", () => {
    it("should handle entities with empty string ids", () => {
      const array = [
        createTestEntity("", "Empty ID Entity", 100),
        createTestEntity("1", "Normal Entity", 200),
      ];
      const updatedEntity = createTestEntity(
        "",
        "Updated Empty ID Entity",
        999,
      );

      const result = mergeEntity(array, updatedEntity);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(updatedEntity);
      expect(result[1]).toEqual(array[1]);
    });

    it("should handle adding entity with empty string id to empty array", () => {
      const array: TestEntity[] = [];
      const newEntity = createTestEntity("", "Empty ID Entity", 100);

      const result = mergeEntity(array, newEntity);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newEntity);
    });

    it("should handle updating when multiple entities have the same id", () => {
      // This shouldn't happen in practice, but testing the behavior
      const array = [
        createTestEntity("duplicate", "First Duplicate", 100),
        createTestEntity("duplicate", "Second Duplicate", 200),
        createTestEntity("3", "Third Entity", 300),
      ];
      const updatedEntity = createTestEntity(
        "duplicate",
        "Updated Duplicate",
        999,
      );

      const result = mergeEntity(array, updatedEntity);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(updatedEntity); // Should update the first match
      expect(result[1].id).toBe("duplicate"); // Second duplicate should remain unchanged
      expect(result[1].name).toBe("Second Duplicate");
      expect(result[2]).toEqual(array[2]);
    });
  });

  describe("type safety", () => {
    it("should work with different entity types that have id", () => {
      type DifferentEntity = {
        id: string;
        title: string;
        active: boolean;
      };

      const array: DifferentEntity[] = [
        { id: "1", title: "First", active: true },
        { id: "2", title: "Second", active: false },
      ];
      const newEntity: DifferentEntity = {
        id: "3",
        title: "Third",
        active: true,
      };

      const result = mergeEntity(array, newEntity);

      expect(result).toHaveLength(3);
      expect(result[2]).toEqual(newEntity);
    });

    it("should work with minimal entities that only have id", () => {
      type MinimalEntity = {
        id: string;
      };

      const array: MinimalEntity[] = [{ id: "1" }, { id: "2" }];
      const updatedEntity: MinimalEntity = { id: "1" };

      const result = mergeEntity(array, updatedEntity);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(updatedEntity);
      expect(result[1]).toEqual(array[1]);
    });
  });

  describe("performance considerations", () => {
    it("should handle large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) =>
        createTestEntity(`id-${i}`, `Entity ${i}`, i),
      );
      const updatedEntity = createTestEntity(
        "id-999",
        "Updated Last Entity",
        9999,
      );

      const result = mergeEntity(largeArray, updatedEntity);

      expect(result).toHaveLength(1000);
      expect(result[999]).toEqual(updatedEntity);
      expect(result[0]).toEqual(largeArray[0]);
      expect(result[500]).toEqual(largeArray[500]);
    });

    it("should add to large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) =>
        createTestEntity(`id-${i}`, `Entity ${i}`, i),
      );
      const newEntity = createTestEntity("new-id", "New Entity", 5000);

      const result = mergeEntity(largeArray, newEntity);

      expect(result).toHaveLength(1001);
      expect(result[1000]).toEqual(newEntity);
      expect(result[999]).toEqual(largeArray[999]);
    });
  });
});
