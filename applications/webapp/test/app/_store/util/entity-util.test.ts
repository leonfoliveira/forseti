import { mergeEntity, mergeEntityBatch } from "@/app/_store/util/entity-util";

describe("entity-util", () => {
  describe("mergeEntity", () => {
    type TestEntity = {
      id: string;
      name: string;
      value: number;
      version: number;
    };

    const createTestEntity = (
      id: string,
      name: string,
      value: number,
      version: number,
    ): TestEntity => ({
      id,
      name,
      value,
      version,
    });

    describe("when adding new entities", () => {
      it("should add a new entity to an empty array", () => {
        const array: TestEntity[] = [];
        const newEntity = createTestEntity("1", "First Entity", 100, 1);

        const result = mergeEntity(array, newEntity);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(newEntity);
      });

      it("should add a new entity to an existing array", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
        ];
        const newEntity = createTestEntity("3", "Third Entity", 300, 1);

        const result = mergeEntity(array, newEntity);

        expect(result).toHaveLength(3);
        expect(result[2]).toEqual(newEntity);
        expect(result[0]).toEqual(array[0]);
        expect(result[1]).toEqual(array[1]);
      });

      it("should not modify the original array when adding", () => {
        const array = [createTestEntity("1", "First Entity", 100, 1)];
        const originalArray = [...array];
        const newEntity = createTestEntity("2", "Second Entity", 200, 1);

        const result = mergeEntity(array, newEntity);

        expect(array).toEqual(originalArray);
        expect(result).not.toBe(array);
      });
    });

    describe("when updating existing entities", () => {
      it("should update an entity when id exists", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
          createTestEntity("3", "Third Entity", 300, 1),
        ];
        const updatedEntity = createTestEntity(
          "2",
          "Updated Second Entity",
          999,
          2,
        );

        const result = mergeEntity(array, updatedEntity);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(array[0]);
        expect(result[1]).toEqual(updatedEntity);
        expect(result[2]).toEqual(array[2]);
      });

      it("should update the first entity when it matches", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
        ];
        const updatedEntity = createTestEntity(
          "1",
          "Updated First Entity",
          555,
          2,
        );

        const result = mergeEntity(array, updatedEntity);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(updatedEntity);
        expect(result[1]).toEqual(array[1]);
      });

      it("should update the last entity when it matches", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
          createTestEntity("3", "Third Entity", 300, 1),
        ];
        const updatedEntity = createTestEntity(
          "3",
          "Updated Third Entity",
          777,
          2,
        );

        const result = mergeEntity(array, updatedEntity);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(array[0]);
        expect(result[1]).toEqual(array[1]);
        expect(result[2]).toEqual(updatedEntity);
      });

      it("should not modify the original array when updating", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
        ];
        const originalArray = [...array];
        const updatedEntity = createTestEntity(
          "1",
          "Updated First Entity",
          555,
          2,
        );

        const result = mergeEntity(array, updatedEntity);

        expect(array).toEqual(originalArray);
        expect(result).not.toBe(array);
      });

      it("should not update if the existing entity has a higher version", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 2),
          createTestEntity("2", "Second Entity", 200, 1),
        ];
        const updatedEntity = createTestEntity(
          "1",
          "Updated First Entity",
          555,
          1,
        );

        const result = mergeEntity(array, updatedEntity);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(array[0]);
        expect(result[1]).toEqual(array[1]);
      });
    });
  });

  describe("mergeEntityBatch", () => {
    type TestEntity = {
      id: string;
      name: string;
      value: number;
      version: number;
    };

    const createTestEntity = (
      id: string,
      name: string,
      value: number,
      version: number,
    ): TestEntity => ({
      id,
      name,
      value,
      version,
    });

    describe("when adding new entities", () => {
      it("should add multiple entities to an empty array", () => {
        const array: TestEntity[] = [];
        const newEntities = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
          createTestEntity("3", "Third Entity", 300, 1),
        ];

        const result = mergeEntityBatch(array, newEntities);

        expect(result).toHaveLength(3);
        expect(result).toEqual(newEntities);
      });

      it("should add multiple entities to an existing array", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
        ];
        const newEntities = [
          createTestEntity("3", "Third Entity", 300, 1),
          createTestEntity("4", "Fourth Entity", 400, 1),
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
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
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
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
          createTestEntity("3", "Third Entity", 300, 1),
        ];
        const updatedEntities = [
          createTestEntity("1", "Updated First", 999, 2),
          createTestEntity("3", "Updated Third", 777, 2),
        ];

        const result = mergeEntityBatch(array, updatedEntities);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(updatedEntities[0]);
        expect(result[1]).toEqual(array[1]); // Unchanged
        expect(result[2]).toEqual(updatedEntities[1]);
      });

      it("should update all entities when all IDs match", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
        ];
        const updatedEntities = [
          createTestEntity("2", "Updated Second", 999, 2),
          createTestEntity("1", "Updated First", 777, 2),
        ];

        const result = mergeEntityBatch(array, updatedEntities);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(
          createTestEntity("1", "Updated First", 777, 2),
        );
        expect(result[1]).toEqual(
          createTestEntity("2", "Updated Second", 999, 2),
        );
      });
    });

    describe("when performing mixed operations", () => {
      it("should update some entities and add new ones", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 1),
          createTestEntity("2", "Second Entity", 200, 1),
          createTestEntity("3", "Third Entity", 300, 1),
        ];
        const batchEntities = [
          createTestEntity("2", "Updated Second", 999, 2), // Update
          createTestEntity("4", "Fourth Entity", 400, 2), // Add new
          createTestEntity("1", "Updated First", 777, 2), // Update
          createTestEntity("5", "Fifth Entity", 500, 2), // Add new
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(5);
        expect(result[0]).toEqual(
          createTestEntity("1", "Updated First", 777, 2),
        );
        expect(result[1]).toEqual(
          createTestEntity("2", "Updated Second", 999, 2),
        );
        expect(result[2]).toEqual(array[2]); // Unchanged
        expect(result[3]).toEqual(
          createTestEntity("4", "Fourth Entity", 400, 2),
        );
        expect(result[4]).toEqual(
          createTestEntity("5", "Fifth Entity", 500, 2),
        );
      });

      it("should preserve order of original entities while appending new ones", () => {
        const array = [
          createTestEntity("c", "Third Entity", 300, 1),
          createTestEntity("a", "First Entity", 100, 1),
          createTestEntity("b", "Second Entity", 200, 1),
        ];
        const batchEntities = [
          createTestEntity("z", "Last Entity", 900, 2),
          createTestEntity("a", "Updated First", 777, 2),
          createTestEntity("y", "Second Last", 800, 2),
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(5);
        expect(result[0]).toEqual(array[0]); // c - unchanged
        expect(result[1]).toEqual(
          createTestEntity("a", "Updated First", 777, 2),
        ); // a - updated
        expect(result[2]).toEqual(array[2]); // b - unchanged
        expect(result[3]).toEqual(createTestEntity("z", "Last Entity", 900, 2)); // z - new
        expect(result[4]).toEqual(createTestEntity("y", "Second Last", 800, 2)); // y - new
      });

      it("should not modify the entities with version greater than the existing ones", () => {
        const array = [
          createTestEntity("1", "First Entity", 100, 2),
          createTestEntity("2", "Second Entity", 200, 2),
        ];
        const batchEntities = [
          createTestEntity("1", "Updated First", 999, 1), // Older version
          createTestEntity("2", "Updated Second", 999, 3), // Newer version
          createTestEntity("3", "Third Entity", 300, 1), // New entity
        ];

        const result = mergeEntityBatch(array, batchEntities);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(array[0]); // Unchanged due to older version
        expect(result[1]).toEqual(
          createTestEntity("2", "Updated Second", 999, 3),
        ); // Updated due to newer version
        expect(result[2]).toEqual(
          createTestEntity("3", "Third Entity", 300, 1),
        ); // New entity added
      });
    });
  });
});
