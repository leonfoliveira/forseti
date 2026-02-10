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

    it("should validate when parentId is provided", () => {
      const validData = {
        problemId: "problem-1",
        parentId: "parent-clarification-id",
        text: "This is a response to a clarification",
      };

      const { error } = ClarificationForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate when parentId is empty string", () => {
      const validData = {
        problemId: "problem-1",
        parentId: "",
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
        "app.[slug].(dashboard)._common._form.clarification-form-schema.problem-required",
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
        "app.[slug].(dashboard)._common._form.clarification-form-schema.problem-required",
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
        "app.[slug].(dashboard)._common._form.clarification-form-schema.text-required",
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
        "app.[slug].(dashboard)._common._form.clarification-form-schema.text-required",
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
        "app.[slug].(dashboard)._common._form.clarification-form-schema.text-long",
      );
    });
  });

  describe("toInputDTO", () => {
    it("should convert form data to input DTO with all fields", () => {
      const formData = {
        problemId: "problem-1",
        parentId: "parent-id",
        text: "This is a clarification request",
      };

      const dto = ClarificationForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: "problem-1",
        parentId: "parent-id",
        text: "This is a clarification request",
      });
    });

    it("should convert form data to input DTO without parentId when empty", () => {
      const formData = {
        problemId: "problem-1",
        parentId: "",
        text: "This is a clarification request",
      };

      const dto = ClarificationForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: "problem-1",
        parentId: undefined,
        text: "This is a clarification request",
      });
    });

    it("should convert form data to input DTO without parentId when undefined", () => {
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
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = ClarificationForm.getDefault();

      expect(defaultValues).toEqual({
        parentId: undefined,
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
        "app.[slug].(dashboard)._common._form.clarification-form-schema.problem-required",
      );
      expect(ClarificationForm.messages.textRequired.id).toBe(
        "app.[slug].(dashboard)._common._form.clarification-form-schema.text-required",
      );
      expect(ClarificationForm.messages.textLong.id).toBe(
        "app.[slug].(dashboard)._common._form.clarification-form-schema.text-long",
      );
    });
  });
});
