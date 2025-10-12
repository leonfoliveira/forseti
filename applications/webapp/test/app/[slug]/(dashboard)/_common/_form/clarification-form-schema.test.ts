import { clarificationFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-schema";

describe("clarificationFormSchema", () => {
  const validData = {
    problemId: "problem-1",
    parentId: "parent-1",
    text: "New Clarification",
  };

  it("should validate data", () => {
    expect(
      clarificationFormSchema.validate(validData).error?.message,
    ).toBeUndefined();
  });

  it("should validate data without problemId", () => {
    expect(
      clarificationFormSchema.validate({ ...validData, problemId: undefined })
        .error?.message,
    ).toBeUndefined();
  });

  it("should validate data without parentId", () => {
    expect(
      clarificationFormSchema.validate({ ...validData, parentId: undefined })
        .error?.message,
    ).toBeUndefined();
  });

  it("should validate data with empty problemId", () => {
    expect(
      clarificationFormSchema.validate({ ...validData, problemId: "" }).error
        ?.message,
    ).toBeUndefined();
  });

  it("should validate data with empty parentId", () => {
    expect(
      clarificationFormSchema.validate({ ...validData, parentId: "" }).error
        ?.message,
    ).toBeUndefined();
  });

  describe("text", () => {
    it("should not be empty", () => {
      expect(
        clarificationFormSchema.validate({ ...validData, text: "" }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should have less then 256 characters", () => {
      expect(
        clarificationFormSchema.validate({
          ...validData,
          text: "a".repeat(256),
        }).error?.message,
      ).not.toBeUndefined();
    });
  });
});
