import { submissionJudgeFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/submission-judge-form-schema";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

describe("submissionJudgeFormSchema", () => {
  const validData = {
    answer: SubmissionAnswer.ACCEPTED,
  };

  it("should validate data", () => {
    expect(
      submissionJudgeFormSchema.validate(validData).error?.message,
    ).toBeUndefined();
  });

  it("should validate data with different answer", () => {
    const dataWithWrongAnswer = {
      answer: SubmissionAnswer.WRONG_ANSWER,
    };
    expect(
      submissionJudgeFormSchema.validate(dataWithWrongAnswer).error?.message,
    ).toBeUndefined();
  });

  describe("answer", () => {
    it("should not be empty", () => {
      expect(
        submissionJudgeFormSchema.validate({ ...validData, answer: "" }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should be required", () => {
      expect(
        submissionJudgeFormSchema.validate({ ...validData, answer: undefined })
          .error?.message,
      ).not.toBeUndefined();
    });
  });
});
