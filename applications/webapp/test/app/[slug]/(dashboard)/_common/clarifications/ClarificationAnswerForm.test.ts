import { ClarificationAnswerForm } from "@/app/[slug]/(dashboard)/_common/clarifications/ClarificationAnswerForm";

describe("ClarificationAnswerForm", () => {
  describe("schema validation", () => {
    it("should validate when text is provided", () => {
      const validData = {
        text: "This is an answer to a clarification",
      };

      const { error } = ClarificationAnswerForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with short text", () => {
      const validData = {
        text: "Yes",
      };

      const { error } = ClarificationAnswerForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with maximum allowed text length", () => {
      const maxText = "a".repeat(255);
      const validData = {
        text: maxText,
      };

      const { error } = ClarificationAnswerForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with special characters", () => {
      const validData = {
        text: "Please check section 2.3 of the problem @contestant #important",
      };

      const { error } = ClarificationAnswerForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with unicode characters", () => {
      const validData = {
        text: "Answer with unicode: 新しい回答 Ответ на вопрос 🔍",
      };

      const { error } = ClarificationAnswerForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should fail validation when text is missing", () => {
      const invalidData = {};

      const { error } = ClarificationAnswerForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe("Text is required");
    });

    it("should fail validation when text is empty string", () => {
      const invalidData = {
        text: "",
      };

      const { error } = ClarificationAnswerForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe("Text is required");
    });

    it("should fail validation when text exceeds maximum length", () => {
      const tooLongText = "a".repeat(256);
      const invalidData = {
        text: tooLongText,
      };

      const { error } = ClarificationAnswerForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "Text cannot exceed 255 characters",
      );
    });

    it("should fail validation when text is exactly 256 characters", () => {
      const tooLongText = "a".repeat(256);
      const invalidData = {
        text: tooLongText,
      };

      const { error } = ClarificationAnswerForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe(
        "Text cannot exceed 255 characters",
      );
    });
  });

  describe("toInputDTO", () => {
    it("should convert form data to input DTO", () => {
      const formData = {
        text: "This is an answer to the clarification",
      };

      const dto = ClarificationAnswerForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: undefined,
        text: "This is an answer to the clarification",
      });
    });

    it("should convert form data with special characters", () => {
      const formData = {
        text: "Answer with special chars: @user #tag 🎯",
      };

      const dto = ClarificationAnswerForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: undefined,
        text: "Answer with special chars: @user #tag 🎯",
      });
    });

    it("should convert form data with unicode characters", () => {
      const formData = {
        text: "Unicode answer: 新しい回答 Ответ на вопрос",
      };

      const dto = ClarificationAnswerForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: undefined,
        text: "Unicode answer: 新しい回答 Ответ на вопрос",
      });
    });
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = ClarificationAnswerForm.getDefault();

      expect(defaultValues).toEqual({
        text: "",
      });
    });
  });
});
