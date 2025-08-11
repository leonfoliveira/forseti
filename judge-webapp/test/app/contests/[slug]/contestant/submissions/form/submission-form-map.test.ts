import { SubmissionFormMap } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form-map";
import { Language } from "@/core/domain/enumerate/Language";

describe("SubmissionFormMap", () => {
  it("should map SubmissionForm to CreateSubmissionInputDTO", () => {
    const submission = {
      language: Language.PYTHON_3_13_3,
      code: new File(["code"], "solution.py", { type: "text/x-python" }),
    };

    const result = SubmissionFormMap.toInputDTO(submission);

    expect(result).toEqual({
      language: submission.language,
      code: submission.code,
    });
  });
});
