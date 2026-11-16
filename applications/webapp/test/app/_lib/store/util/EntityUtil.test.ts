import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { MockSubmissionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("EntityUtil", () => {
  describe("merge", () => {
    it("should merge a new entity into an array", () => {
      const array: SubmissionResponseDTO[] = [];
      const item = MockSubmissionResponseDTO();
      const result = EntityUtil.merge(array, item);
      expect(result).toEqual([item]);
    });

    it("should update an existing entity in an array", () => {
      const item = MockSubmissionResponseDTO();
      const array: SubmissionResponseDTO[] = [item];
      const updatedItem = { ...item, version: item.version + 1 };
      const result = EntityUtil.merge(array, updatedItem);
      expect(result).toEqual([updatedItem]);
    });

    it("should ignore entities with version lower than existing entity", () => {
      const item = MockSubmissionResponseDTO();
      const array: SubmissionResponseDTO[] = [item];
      const lowerVersionItem = { ...item, version: item.version - 1 };
      const result = EntityUtil.merge(array, lowerVersionItem);
      expect(result).toEqual([item]);
    });
  });

  describe("mergeBatch", () => {
    it("should merge a new entity into an array", () => {
      const array: SubmissionResponseDTO[] = [];
      const item = MockSubmissionResponseDTO();
      const result = EntityUtil.mergeBatch(array, [item]);
      expect(result).toEqual([item]);
    });

    it("should update existing entities in an array", () => {
      const item = MockSubmissionResponseDTO();
      const array: SubmissionResponseDTO[] = [item];
      const updatedItem = { ...item, version: item.version + 1 };
      const result = EntityUtil.mergeBatch(array, [updatedItem]);
      expect(result).toEqual([updatedItem]);
    });

    it("should ignore entities with lower version in batch", () => {
      const item = MockSubmissionResponseDTO();
      const array: SubmissionResponseDTO[] = [item];
      const lowerVersionItem = { ...item, version: item.version - 1 };
      const result = EntityUtil.mergeBatch(array, [lowerVersionItem]);
      expect(result).toEqual([item]);
    });
  });
});
