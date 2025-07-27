import { ClarificationForm } from "@/app/contests/[slug]/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/contests/[slug]/_common/_form/clarification-form-map";

describe("ClarificationFormMap", () => {
  it("should map ClarificationFormType to CreateClarificationRequestDTO", () => {
    const input: ClarificationForm = {
      parentId: "parent123",
      problemId: "problem123",
      text: "This is a test clarification",
    };

    const result = ClarificationFormMap.toInputDTO(input);

    expect(result).toEqual({
      parentId: "parent123",
      problemId: "problem123",
      text: "This is a test clarification",
    });
  });

  it("should map ClarificationFormType to CreateClarificationRequestDTO without optional fields", () => {
    const input: ClarificationForm = {
      text: "This is a test clarification without optional fields",
    };

    const result = ClarificationFormMap.toInputDTO(input);

    expect(result).toEqual({
      parentId: undefined,
      problemId: undefined,
      text: "This is a test clarification without optional fields",
    });
  });
});
