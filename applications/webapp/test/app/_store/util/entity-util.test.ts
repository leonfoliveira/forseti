import { mergeEntity, mergeEntityBatch } from "@/app/_store/util/entity-util";

describe("entity-util", () => {
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
        const updatedEntity = createTestEntity(
          "2",
          "Updated Second Entity",
          999,
        );

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
        const updatedEntity = createTestEntity(
          "1",
          "Updated First Entity",
          555,
        );

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
        const updatedEntity = createTestEntity(
          "3",
          "Updated Third Entity",
          777,
        );

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
        const updatedEntity = createTestEntity(
          "1",
          "Updated First Entity",
          555,
        );

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

  describe("mergeEntityBatch", () => {
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
      it("should add multiple entities to an empty array", () => {
        const array: TestEntity[] = [];
        const newEntities = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
          createTestEntity("3", "Third Entity", 300),
        ];

        const result = mergeEntityBatch(array, newEntities);

        expect(result).toHaveLength(3);
        expect(result).toEqual(newEntities);
      });

      it("should add multiple entities to an existing array", () => {
        const array = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
        ];
        const newEntities = [
          createTestEntity("3", "Third Entity", 300),
          createTestEntity("4", "Fourth Entity", 400),
        ];

        const result = mergeEntityBatch(array, newEntities);

        expect(result).toHaveLength(4);
        expect(result[0]).toEqual(array[0]);
        expect(result[1]).toEqual(array[1]);
        expect(result[2]).toEqual(newEntities[0]);
        expect(result[3]).toEqual(newEntities[1]);
      });

      it("should handle empty batch gracefully", () => {
        const array = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
        ];
        const emptyBatch: TestEntity[] = [];

        const result = mergeEntityBatch(array, emptyBatch);

        expect(result).toHaveLength(2);
        expect(result).toEqual(array);
        expect(result).not.toBe(array); // Should still create a new array
      });
    });

    describe("when updating existing entities", () => {
      it("should update multiple existing entities", () => {
        const array = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
          createTestEntity("3", "Third Entity", 300),
        ];
        const updatedEntities = [
          createTestEntity("1", "Updated First", 999),
          createTestEntity("3", "Updated Third", 777),
        ];

        const result = mergeEntityBatch(array, updatedEntities);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(updatedEntities[0]);
        expect(result[1]).toEqual(array[1]); // Unchanged
        expect(result[2]).toEqual(updatedEntities[1]);
      });

      it("should update all entities when all IDs match", () => {
        const array = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
        ];
        const updatedEntities = [
          createTestEntity("2", "Updated Second", 999),
          createTestEntity("1", "Updated First", 777),
        ];

        const result = mergeEntityBatch(array, updatedEntities);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(createTestEntity("1", "Updated First", 777));
        expect(result[1]).toEqual(createTestEntity("2", "Updated Second", 999));
      });
    });

    describe("when performing mixed operations", () => {
      it("should update some entities and add new ones", () => {
        const array = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
          createTestEntity("3", "Third Entity", 300),
        ];
        const batchEntities = [
          createTestEntity("2", "Updated Second", 999), // Update
          createTestEntity("4", "Fourth Entity", 400), // Add new
          createTestEntity("1", "Updated First", 777), // Update
          createTestEntity("5", "Fifth Entity", 500), // Add new
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(5);
        expect(result[0]).toEqual(createTestEntity("1", "Updated First", 777));
        expect(result[1]).toEqual(createTestEntity("2", "Updated Second", 999));
        expect(result[2]).toEqual(array[2]); // Unchanged
        expect(result[3]).toEqual(createTestEntity("4", "Fourth Entity", 400));
        expect(result[4]).toEqual(createTestEntity("5", "Fifth Entity", 500));
      });

      it("should preserve order of original entities while appending new ones", () => {
        const array = [
          createTestEntity("c", "Third Entity", 300),
          createTestEntity("a", "First Entity", 100),
          createTestEntity("b", "Second Entity", 200),
        ];
        const batchEntities = [
          createTestEntity("z", "Last Entity", 900),
          createTestEntity("a", "Updated First", 777),
          createTestEntity("y", "Second Last", 800),
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(5);
        expect(result[0]).toEqual(array[0]); // c - unchanged
        expect(result[1]).toEqual(createTestEntity("a", "Updated First", 777)); // a - updated
        expect(result[2]).toEqual(array[2]); // b - unchanged
        expect(result[3]).toEqual(createTestEntity("z", "Last Entity", 900)); // z - new
        expect(result[4]).toEqual(createTestEntity("y", "Second Last", 800)); // y - new
      });
    });

    describe("edge cases", () => {
      it("should handle duplicate IDs in the batch (last one wins)", () => {
        const array = [createTestEntity("1", "Original", 100)];
        const batchEntities = [
          createTestEntity("1", "First Update", 200),
          createTestEntity("1", "Second Update", 300),
          createTestEntity("1", "Final Update", 400),
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(createTestEntity("1", "Final Update", 400));
      });

      it("should handle entities with empty string IDs", () => {
        const array = [
          createTestEntity("", "Empty ID Original", 100),
          createTestEntity("1", "Normal Entity", 200),
        ];
        const batchEntities = [
          createTestEntity("", "Empty ID Updated", 999),
          createTestEntity("2", "New Normal", 300),
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(
          createTestEntity("", "Empty ID Updated", 999),
        );
        expect(result[1]).toEqual(array[1]); // Unchanged
        expect(result[2]).toEqual(createTestEntity("2", "New Normal", 300));
      });

      it("should not modify the original array or batch", () => {
        const array = [
          createTestEntity("1", "First Entity", 100),
          createTestEntity("2", "Second Entity", 200),
        ];
        const batchEntities = [
          createTestEntity("1", "Updated First", 999),
          createTestEntity("3", "New Third", 300),
        ];
        const originalArray = [...array];
        const originalBatch = [...batchEntities];

        const result = mergeEntityBatch(array, batchEntities);

        expect(array).toEqual(originalArray);
        expect(batchEntities).toEqual(originalBatch);
        expect(result).not.toBe(array);
        expect(result).not.toBe(batchEntities);
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
        const batchEntities: DifferentEntity[] = [
          { id: "2", title: "Updated Second", active: true },
          { id: "3", title: "Third", active: true },
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(array[0]);
        expect(result[1]).toEqual(batchEntities[0]);
        expect(result[2]).toEqual(batchEntities[1]);
      });

      it("should work with minimal entities that only have id", () => {
        type MinimalEntity = {
          id: string;
        };

        const array: MinimalEntity[] = [{ id: "1" }, { id: "2" }];
        const batchEntities: MinimalEntity[] = [{ id: "2" }, { id: "3" }];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ id: "1" });
        expect(result[1]).toEqual({ id: "2" });
        expect(result[2]).toEqual({ id: "3" });
      });
    });

    describe("performance considerations", () => {
      it("should handle large arrays and batches efficiently", () => {
        const largeArray = Array.from({ length: 1000 }, (_, i) =>
          createTestEntity(`existing-${i}`, `Entity ${i}`, i),
        );
        const largeBatch = [
          ...Array.from({ length: 100 }, (_, i) =>
            createTestEntity(`existing-${i}`, `Updated ${i}`, i * 10),
          ), // Updates
          ...Array.from({ length: 500 }, (_, i) =>
            createTestEntity(`new-${i}`, `New Entity ${i}`, i + 2000),
          ), // New entities
        ];

        const result = mergeEntityBatch(largeArray, largeBatch);

        expect(result).toHaveLength(1500); // 1000 original + 500 new
        // Check some updates
        expect(result[0]).toEqual(
          createTestEntity("existing-0", "Updated 0", 0),
        );
        expect(result[99]).toEqual(
          createTestEntity("existing-99", "Updated 99", 990),
        );
        // Check unchanged entities
        expect(result[100]).toEqual(largeArray[100]);
        expect(result[500]).toEqual(largeArray[500]);
        // Check new entities are at the end
        expect(result[1000]).toEqual(
          createTestEntity("new-0", "New Entity 0", 2000),
        );
        expect(result[1399]).toEqual(
          createTestEntity("new-399", "New Entity 399", 2399),
        );
      });

      it("should efficiently handle batch with only new entities", () => {
        const array = Array.from({ length: 100 }, (_, i) =>
          createTestEntity(`existing-${i}`, `Entity ${i}`, i),
        );
        const newBatch = Array.from({ length: 100 }, (_, i) =>
          createTestEntity(`new-${i}`, `New Entity ${i}`, i + 1000),
        );

        const result = mergeEntityBatch(array, newBatch);

        expect(result).toHaveLength(200);
        expect(result.slice(0, 100)).toEqual(array);
        expect(result.slice(100, 200)).toEqual(newBatch);
      });

      it("should efficiently handle batch with only updates", () => {
        const array = Array.from({ length: 100 }, (_, i) =>
          createTestEntity(`id-${i}`, `Entity ${i}`, i),
        );
        const updateBatch = Array.from({ length: 100 }, (_, i) =>
          createTestEntity(`id-${i}`, `Updated Entity ${i}`, i * 10),
        );

        const result = mergeEntityBatch(array, updateBatch);

        expect(result).toHaveLength(100);
        expect(result).toEqual(updateBatch);
      });
    });
  });
});
