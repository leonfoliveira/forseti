import { clarificationFormSchema } from "@/app/contests/[slug]/_common/_form/clarification-form-schema";

describe("clarificationFormSchema", () => {
  const validData = {
    problemId: "problem123",
    parentId: "parentId",
    text: "This is a valid clarification",
  };

  it("should validate valid data", () => {
    expect(clarificationFormSchema.validate(validData).error).toBeUndefined();
  });

  it("should validate text", () => {
    expect(
      clarificationFormSchema.validate({ ...validData, text: undefined }).error
        ?.message,
    ).toBe("text:required");
    expect(
      clarificationFormSchema.validate({ ...validData, text: "" }).error
        ?.message,
    ).toBe("text:required");
  });
});
