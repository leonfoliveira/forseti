import { ClarificationAnswerForm } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationAnswerForm";

describe("ClarificationAnswerForm", () => {
  describe("schema", () => {
    const validData = {
      text: "Sample clarification answer",
    };

    it("validates correct data", () => {
      expect(
        ClarificationAnswerForm.schema.validate(validData).error,
      ).toBeUndefined();
    });

    it("validates text", () => {
      expect(
        ClarificationAnswerForm.schema.validate({ text: "" }).error?.message,
      ).toContain("Text is required");
      expect(
        ClarificationAnswerForm.schema.validate({ text: "a".repeat(256) }).error
          ?.message,
      ).toContain("Text cannot exceed 255 characters");
    });
  });

  describe("toInputDTO", () => {
    it("converts form data to input DTO", () => {
      const formData = {
        text: "Sample clarification answer",
      };
      const inputDTO = ClarificationAnswerForm.toInputDTO(formData);
      expect(inputDTO).toEqual({
        text: "Sample clarification answer",
      });
    });
  });

  describe("getDefault", () => {
    it("returns default form data", () => {
      const defaultData = ClarificationAnswerForm.getDefault();
      expect(defaultData).toEqual({
        text: "",
      });
    });
  });
});
