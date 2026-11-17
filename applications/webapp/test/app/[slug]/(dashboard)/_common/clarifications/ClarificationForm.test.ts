import { ClarificationForm } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationForm";

describe("ClarificationForm", () => {
  describe("schema", () => {
    const validData = {
      problemId: "sample-problem-id",
      text: "sample-text",
    };

    it("validates correct data", () => {
      expect(
        ClarificationForm.schema.validate(validData).error,
      ).toBeUndefined();
    });

    it("validates text", () => {
      expect(
        ClarificationForm.schema.validate({ text: "" }).error?.message,
      ).toContain(
        "[slug].(dashboard)._common.clarifications.ClarificationForm.textRequired",
      );
      expect(
        ClarificationForm.schema.validate({ text: "a".repeat(501) }).error
          ?.message,
      ).toContain(
        "[slug].(dashboard)._common.clarifications.ClarificationForm.textTooLong",
      );
    });
  });

  describe("toInputDTO", () => {
    it("converts form data to input DTO", () => {
      const formData = {
        problemId: "sample-problem-id",
        text: "Sample clarification",
      };
      const inputDTO = ClarificationForm.toInputDTO(formData);
      expect(inputDTO).toEqual({
        problemId: "sample-problem-id",
        text: "Sample clarification",
      });
    });
  });

  describe("getDefault", () => {
    it("returns default form data", () => {
      const defaultData = ClarificationForm.getDefault();
      expect(defaultData).toEqual({
        problemId: "__none__",
        text: "",
      });
    });
  });
});
