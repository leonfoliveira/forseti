import { Language } from "@/core/domain/enumerate/Language";
import { submissionFormSchema } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-schema";

describe("submissionFormSchema", () => {
  const validData = {
    problemId: "problem1",
    language: Language.PYTHON_3_13_3,
    code: new File(["code"], "hello.py", {
      type: "text/x-python",
    }),
  };

  it("should validate correct data", () => {
    expect(submissionFormSchema.validate(validData).error).toBeUndefined();
  });

  it("should invalidate problemId", () => {
    expect(
      submissionFormSchema.validate({ ...validData, problemId: undefined })
        .error?.message,
    ).toEqual("problem:required");
  });

  it("should invalidate language", () => {
    expect(
      submissionFormSchema.validate({ ...validData, language: undefined }).error
        ?.message,
    ).toEqual("language:required");
  });

  it("should invalidate code", () => {
    expect(
      submissionFormSchema.validate({ ...validData, code: undefined }).error
        ?.message,
    ).toEqual("code:required");
  });
});
