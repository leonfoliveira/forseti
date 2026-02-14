import { SubmissionJudgeForm } from "@/app/[slug]/(dashboard)/_common/submissions/submission-judge-form";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

describe("SubmissionJudgeForm", () => {
  describe("schema validation", () => {
    it("should validate when answer is provided", () => {
      const validData = {
        answer: SubmissionAnswer.ACCEPTED,
      };

      const { error } = SubmissionJudgeForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with all valid answers", () => {
      const validAnswers = [
        SubmissionAnswer.ACCEPTED,
        SubmissionAnswer.WRONG_ANSWER,
        SubmissionAnswer.COMPILATION_ERROR,
        SubmissionAnswer.RUNTIME_ERROR,
        SubmissionAnswer.TIME_LIMIT_EXCEEDED,
        SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
      ];

      validAnswers.forEach((answer) => {
        const validData = { answer };
        const { error } = SubmissionJudgeForm.schema.validate(validData);
        expect(error).toBeUndefined();
      });
    });

    it("should fail validation when answer is missing", () => {
      const invalidData = {};

      const { error } = SubmissionJudgeForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["answer"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.submissions.submission-judge-form.answer-required",
      );
    });

    it("should fail validation when answer is empty string", () => {
      const invalidData = {
        answer: "",
      };

      const { error } = SubmissionJudgeForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["answer"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.submissions.submission-judge-form.answer-required",
      );
    });
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = SubmissionJudgeForm.getDefault();

      expect(defaultValues).toEqual({
        answer: "",
      });
    });
  });

  describe("messages", () => {
    it("should have all required message definitions", () => {
      expect(SubmissionJudgeForm.messages.answerRequired).toBeDefined();
      expect(SubmissionJudgeForm.messages.answerRequired.id).toBe(
        "app.[slug].(dashboard)._common.submissions.submission-judge-form.answer-required",
      );
    });
  });
});
