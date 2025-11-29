import { findClarification } from "@/app/_store/util/clarification-finder";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

describe("findClarification", () => {
  const mockMember = {
    id: "member-1",
    type: MemberType.CONTESTANT,
    name: "John Doe",
  };

  const mockProblem = {
    id: "problem-1",
    letter: "A",
    title: "Test Problem",
    description: {
      id: "attachment-1",
      filename: "problem.pdf",
      contentType: "application/pdf",
    },
  };

  const createMockClarification = (
    id: string,
    text: string,
    children: ClarificationResponseDTO[] = [],
    parentId?: string,
  ): ClarificationResponseDTO => ({
    id,
    createdAt: "2025-09-04T12:00:00Z",
    member: mockMember,
    problem: mockProblem,
    parentId,
    text,
    children,
  });

  describe("when searching in a flat array", () => {
    const flatClarifications: ClarificationResponseDTO[] = [
      createMockClarification("1", "First clarification"),
      createMockClarification("2", "Second clarification"),
      createMockClarification("3", "Third clarification"),
    ];

    it("should find an existing clarification by id", () => {
      const result = findClarification(flatClarifications, "2");
      expect(result).toBeDefined();
      expect(result?.id).toBe("2");
      expect(result?.text).toBe("Second clarification");
    });

    it("should return undefined for non-existing id", () => {
      const result = findClarification(flatClarifications, "999");
      expect(result).toBeUndefined();
    });

    it("should find the first clarification", () => {
      const result = findClarification(flatClarifications, "1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1");
      expect(result?.text).toBe("First clarification");
    });

    it("should find the last clarification", () => {
      const result = findClarification(flatClarifications, "3");
      expect(result).toBeDefined();
      expect(result?.id).toBe("3");
      expect(result?.text).toBe("Third clarification");
    });
  });

  describe("when searching in a nested structure", () => {
    const nestedClarifications: ClarificationResponseDTO[] = [
      createMockClarification("1", "Root clarification 1", [
        createMockClarification("1.1", "Child of 1", [], "1"),
        createMockClarification(
          "1.2",
          "Another child of 1",
          [createMockClarification("1.2.1", "Grandchild of 1", [], "1.2")],
          "1",
        ),
      ]),
      createMockClarification("2", "Root clarification 2", [
        createMockClarification("2.1", "Child of 2", [], "2"),
      ]),
      createMockClarification("3", "Root clarification 3"),
    ];

    it("should find a root clarification", () => {
      const result = findClarification(nestedClarifications, "2");
      expect(result).toBeDefined();
      expect(result?.id).toBe("2");
      expect(result?.text).toBe("Root clarification 2");
    });

    it("should find a direct child clarification", () => {
      const result = findClarification(nestedClarifications, "1.1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1.1");
      expect(result?.text).toBe("Child of 1");
      expect(result?.parentId).toBe("1");
    });

    it("should find a nested grandchild clarification", () => {
      const result = findClarification(nestedClarifications, "1.2.1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1.2.1");
      expect(result?.text).toBe("Grandchild of 1");
      expect(result?.parentId).toBe("1.2");
    });

    it("should find a clarification that has children", () => {
      const result = findClarification(nestedClarifications, "1.2");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1.2");
      expect(result?.text).toBe("Another child of 1");
      expect(result?.children).toHaveLength(1);
      expect(result?.children[0].id).toBe("1.2.1");
    });

    it("should return undefined for non-existing nested id", () => {
      const result = findClarification(nestedClarifications, "1.3");
      expect(result).toBeUndefined();
    });

    it("should return undefined for non-existing deep nested id", () => {
      const result = findClarification(nestedClarifications, "1.2.2");
      expect(result).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should return undefined when searching in empty array", () => {
      const result = findClarification([], "any-id");
      expect(result).toBeUndefined();
    });

    it("should handle clarifications with empty children arrays", () => {
      const clarifications = [
        createMockClarification("1", "Test clarification", []),
      ];
      const result = findClarification(clarifications, "1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1");
    });

    it("should handle search for empty string id", () => {
      const clarifications = [
        createMockClarification("", "Empty id clarification"),
        createMockClarification("1", "Normal clarification"),
      ];
      const result = findClarification(clarifications, "");
      expect(result).toBeDefined();
      expect(result?.id).toBe("");
      expect(result?.text).toBe("Empty id clarification");
    });

    it("should find first match when multiple clarifications have the same id", () => {
      const clarifications = [
        createMockClarification("duplicate", "First duplicate"),
        createMockClarification("duplicate", "Second duplicate"),
      ];
      const result = findClarification(clarifications, "duplicate");
      expect(result).toBeDefined();
      expect(result?.text).toBe("First duplicate");
    });
  });

  describe("performance considerations", () => {
    it("should handle deeply nested structures", () => {
      // Create a deeply nested structure (5 levels deep)
      const deepChild = createMockClarification("deep-5", "Level 5");
      const level4 = createMockClarification("deep-4", "Level 4", [deepChild]);
      const level3 = createMockClarification("deep-3", "Level 3", [level4]);
      const level2 = createMockClarification("deep-2", "Level 2", [level3]);
      const level1 = createMockClarification("deep-1", "Level 1", [level2]);

      const clarifications = [level1];

      const result = findClarification(clarifications, "deep-5");
      expect(result).toBeDefined();
      expect(result?.id).toBe("deep-5");
      expect(result?.text).toBe("Level 5");
    });

    it("should handle large flat arrays", () => {
      const largeFlatArray = Array.from({ length: 100 }, (_, i) =>
        createMockClarification(`id-${i}`, `Clarification ${i}`),
      );

      // Find an item at the end
      const result = findClarification(largeFlatArray, "id-99");
      expect(result).toBeDefined();
      expect(result?.id).toBe("id-99");
      expect(result?.text).toBe("Clarification 99");
    });
  });
});
