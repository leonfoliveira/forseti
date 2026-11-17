import { SubmissionJudgeForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionJudgeForm";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";

describe("SubmissionJudgeForm", () => {
  const validData = {
    answer: SubmissionAnswer.ACCEPTED,
  };

  describe("schema", () => {
    it("validates correct data", () => {
      expect(
        SubmissionJudgeForm.schema.validate(validData).error,
      ).toBeUndefined();
    });

    it("validates answer", () => {
      expect(
        SubmissionJudgeForm.schema.validate({ ...validData, answer: undefined })
          .error?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionJudgeForm.answerRequired",
      );
      expect(
        SubmissionJudgeForm.schema.validate({ ...validData, answer: "" }).error
          ?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionJudgeForm.answerRequired",
      );
    });
  });

  describe("getDefault", () => {
    it("returns default data", () => {
      const defaultData = SubmissionJudgeForm.getDefault();
      expect(defaultData).toEqual({
        answer: "",
      });
    });
  });
});
