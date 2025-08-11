import { updateSubmissionFormSchema } from "@/app/contests/[slug]/judge/submissions/_form/update-submission-form-schema";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

describe("updateSubmissionFormSchema", () => {
  const validData = {
    answer: SubmissionAnswer.WRONG_ANSWER,
  };

  it("should validate valid data", () => {
    expect(
      updateSubmissionFormSchema.validate(validData).error,
    ).toBeUndefined();
  });

  it("should invalidate answer", () => {
    expect(
      updateSubmissionFormSchema.validate({ ...validData, answer: undefined })
        .error?.message,
    ).toBe("answer:required");
  });
});
