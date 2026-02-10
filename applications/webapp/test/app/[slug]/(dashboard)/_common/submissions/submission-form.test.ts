import { SubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/submission-form";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";

// Mock File constructor for testing
global.File = class {
  name: string;
  size: number;
  type: string;

  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    this.name = name;
    this.size = options?.type === "large" ? 11 * 1024 * 1024 : 1024; // 11MB for large files, 1KB for normal
    this.type = options?.type || "text/plain";
  }
} as any;

describe("SubmissionForm", () => {
  const createMockFile = (size: number = 1024): File => {
    return new File(["test content"], "test.cpp", {
      type: size > 10 * 1024 * 1024 ? "large" : "normal",
    });
  };

  describe("schema validation", () => {
    it("should validate when all fields are provided", () => {
      const validData = {
        problemId: "problem-1",
        language: SubmissionLanguage.CPP_17,
        code: [createMockFile()],
      };

      const { error } = SubmissionForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with all supported languages", () => {
      const languages = [
        SubmissionLanguage.CPP_17,
        SubmissionLanguage.JAVA_21,
        SubmissionLanguage.PYTHON_312,
      ];

      languages.forEach((language) => {
        const validData = {
          problemId: "problem-1",
          language,
          code: [createMockFile()],
        };

        const { error } = SubmissionForm.schema.validate(validData);
        expect(error).toBeUndefined();
      });
    });

    it("should fail validation when problemId is missing", () => {
      const invalidData = {
        language: SubmissionLanguage.CPP_17,
        code: [createMockFile()],
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["problemId"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.problem-required",
      );
    });

    it("should fail validation when problemId is empty string", () => {
      const invalidData = {
        problemId: "",
        language: SubmissionLanguage.CPP_17,
        code: [createMockFile()],
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["problemId"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.problem-required",
      );
    });

    it("should fail validation when language is missing", () => {
      const invalidData = {
        problemId: "problem-1",
        code: [createMockFile()],
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["language"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.language-required",
      );
    });

    it("should fail validation when language is empty string", () => {
      const invalidData = {
        problemId: "problem-1",
        language: "",
        code: [createMockFile()],
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["language"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.language-required",
      );
    });

    it("should fail validation when code is missing", () => {
      const invalidData = {
        problemId: "problem-1",
        language: SubmissionLanguage.CPP_17,
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["code"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.code-required",
      );
    });

    it("should fail validation when code array is empty", () => {
      const invalidData = {
        problemId: "problem-1",
        language: SubmissionLanguage.CPP_17,
        code: [],
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["code"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.code-required",
      );
    });

    it("should fail validation when code file is too large", () => {
      const largeFile = createMockFile(11 * 1024 * 1024); // 11MB file
      const invalidData = {
        problemId: "problem-1",
        language: SubmissionLanguage.CPP_17,
        code: [largeFile],
      };

      const { error } = SubmissionForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["code"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.code-too-large",
      );
    });
  });

  describe("toInputDTO", () => {
    it("should convert form data to input DTO", () => {
      const file = createMockFile();
      const formData = {
        problemId: "problem-1",
        language: SubmissionLanguage.CPP_17,
        code: [file],
      };

      const dto = SubmissionForm.toInputDTO(formData);

      expect(dto).toEqual({
        problemId: "problem-1",
        language: SubmissionLanguage.CPP_17,
        code: file,
      });
    });

    it("should use the first file from the code array", () => {
      const file1 = createMockFile();
      const file2 = createMockFile();
      const formData = {
        problemId: "problem-1",
        language: SubmissionLanguage.JAVA_21,
        code: [file1, file2],
      };

      const dto = SubmissionForm.toInputDTO(formData);

      expect(dto.code).toBe(file1);
    });
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = SubmissionForm.getDefault();

      expect(defaultValues).toEqual({
        problemId: "",
        language: "",
        code: "",
      });
    });
  });

  describe("messages", () => {
    it("should have all required message definitions", () => {
      expect(SubmissionForm.messages.problemRequired).toBeDefined();
      expect(SubmissionForm.messages.languageRequired).toBeDefined();
      expect(SubmissionForm.messages.codeRequired).toBeDefined();
      expect(SubmissionForm.messages.codeTooLarge).toBeDefined();

      expect(SubmissionForm.messages.problemRequired.id).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.problem-required",
      );
      expect(SubmissionForm.messages.languageRequired.id).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.language-required",
      );
      expect(SubmissionForm.messages.codeRequired.id).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.code-required",
      );
      expect(SubmissionForm.messages.codeTooLarge.id).toBe(
        "app.[slug].(dashboard)._common._form.submission-form-schema.code-too-large",
      );
    });
  });
});
