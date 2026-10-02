import { SubmissionJudgeForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionJudgeForm";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";

describe("SubmissionJudgeForm", () => {
  it("defaults answer and validates required answer", () => {
    expect(SubmissionJudgeForm.getDefault().answer).toBe("");
    expect(SubmissionJudgeForm.schema.validate({ answer: SubmissionAnswer.ACCEPTED }).error).toBeUndefined();
    expect(SubmissionJudgeForm.schema.validate({ answer: "" }).error?.message).toBe("Answer is Required");
  });
});
