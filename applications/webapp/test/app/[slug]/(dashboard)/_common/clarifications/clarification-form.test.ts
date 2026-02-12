import { ClarificationForm } from "@/app/[slug]/(dashboard)/_common/clarifications/clarification-form";

describe("ClarificationForm", () => {
  describe("schema validation", () => {
    it("should validate when all required fields are provided", () => {
      const validData = {
        problemId: "problem-1",
        text: "This is a clarification request",
      };

      const { error } = ClarificationForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with special problemId __none__", () => {
      const validData = {
        problemId: "__none__",
        text: "This is a general clarification request",
      };

      const { error } = ClarificationForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with numeric problemId", () => {
      const validData = {
        problemId: "123",
        text: "This is a clarification request",
      };

      const { error } = ClarificationForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with maximum allowed text length", () => {
      const maxText = "a".repeat(255);
      const validData = {
        problemId: "problem-1",
        text: maxText,
      };

      const { error } = ClarificationForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should fail validation when problemId is missing", () => {
      const invalidData = {
        text: "This is a clarification request",
      };

      const { error } = ClarificationForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["problemId"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.problem-required",
      );
    });

    it("should fail validation when problemId is empty string", () => {
      const invalidData = {
        problemId: "",
        text: "This is a clarification request",
      };

      const { error } = ClarificationForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["problemId"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.problem-required",
      );
    });

    it("should fail validation when text is missing", () => {
      const invalidData = {
        problemId: "problem-1",
      };

      const { error } = ClarificationForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.text-required",
      );
    });

    it("should fail validation when text is empty string", () => {
      const invalidData = {
        problemId: "problem-1",
        text: "",
      };

      const { error } = ClarificationForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.text-required",
      );
    });

    it("should fail validation when text exceeds maximum length", () => {
      const tooLongText = "a".repeat(256);
      const invalidData = {
        problemId: "problem-1",
        text: tooLongText,
      };

      const { error } = ClarificationForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.text-long",
      );
    });
  });

  describe("toInputDTO", () => {
    it("should convert form data to input DTO", () => {
      const formData = {
        problemId: "problem-1",
        text: "This is a clarification request",
      };

      const dto = ClarificationForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: "problem-1",
        parentId: undefined,
        text: "This is a clarification request",
      });
    });

    it("should convert form data with empty problemId to undefined", () => {
      const formData = {
        problemId: "",
        text: "This is a clarification request",
      };

      const dto = ClarificationForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: "",
        parentId: undefined,
        text: "This is a clarification request",
      });
    });

    it("should handle special problemId __none__", () => {
      const formData = {
        problemId: "__none__",
        text: "General clarification request",
      };

      const dto = ClarificationForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: undefined,
        parentId: undefined,
        text: "General clarification request",
      });
    });

    it("should always set parentId to undefined for new clarifications", () => {
      const formData = {
        problemId: "problem-1",
        text: "New clarification",
      };

      const dto = ClarificationForm.toInputDTO(formData);

      expect(dto.parentId).toBeUndefined();
    });
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = ClarificationForm.getDefault();

      expect(defaultValues).toEqual({
        problemId: "",
        text: "",
      });
    });
  });

  describe("messages", () => {
    it("should have all required message definitions", () => {
      expect(ClarificationForm.messages.problemRequired).toBeDefined();
      expect(ClarificationForm.messages.textRequired).toBeDefined();
      expect(ClarificationForm.messages.textLong).toBeDefined();

      expect(ClarificationForm.messages.problemRequired.id).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.problem-required",
      );
      expect(ClarificationForm.messages.textRequired.id).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.text-required",
      );
      expect(ClarificationForm.messages.textLong.id).toBe(
        "app.[slug].(dashboard)._common.clarifications.clarification-form.text-long",
      );
    });
  });
});
