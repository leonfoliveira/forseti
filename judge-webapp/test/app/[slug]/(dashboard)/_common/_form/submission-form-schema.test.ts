import { submissionFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-schema";
import { Language } from "@/core/domain/enumerate/Language";

describe("submissionFormSchema", () => {
  const mockFile = new File(["test code"], "test.cpp", { type: "text/plain" });
  const largeMockFile = new File(
    [new ArrayBuffer(11 * 1024 * 1024)], // 11MB file
    "large.cpp",
    { type: "text/plain" },
  );

  const validData = {
    problemId: "problem-1",
    language: Language.CPP_17,
    code: [mockFile],
  };

  it("should validate data", () => {
    expect(
      submissionFormSchema.validate(validData).error?.message,
    ).toBeUndefined();
  });

  describe("problemId", () => {
    it("should not be empty", () => {
      expect(
        submissionFormSchema.validate({ ...validData, problemId: "" }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should be required", () => {
      expect(
        submissionFormSchema.validate({ ...validData, problemId: undefined })
          .error?.message,
      ).not.toBeUndefined();
    });
  });

  describe("language", () => {
    it("should not be empty", () => {
      expect(
        submissionFormSchema.validate({ ...validData, language: "" }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should be required", () => {
      expect(
        submissionFormSchema.validate({ ...validData, language: undefined })
          .error?.message,
      ).not.toBeUndefined();
    });
  });

  describe("code", () => {
    it("should be required", () => {
      expect(
        submissionFormSchema.validate({ ...validData, code: undefined }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should not be empty array", () => {
      expect(
        submissionFormSchema.validate({ ...validData, code: [] }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should reject files larger than 10MB", () => {
      expect(
        submissionFormSchema.validate({ ...validData, code: [largeMockFile] })
          .error?.message,
      ).not.toBeUndefined();
    });
  });
});
