import { SubmissionFormType } from "@/app/contests/[id]/submissions/_form/submission-form-type";
import { Language } from "@/core/domain/enumerate/Language";
import { toInputDTO } from "@/app/contests/[id]/submissions/_form/submission-form-map";

describe("Submission Form Map", () => {
  it("maps submission form data to CreateSubmissionInputDTO with valid data", () => {
    const submission: SubmissionFormType = {
      problemId: 1,
      language: Language.PYTHON_3_13_3,
      code: new File(["console.log('Hello World')"], "code.js", {
        type: "text/javascript",
      }),
    };

    const result = toInputDTO(submission);

    expect(result).toEqual({
      problemId: 1,
      language: Language.PYTHON_3_13_3,
      code: submission.code,
    });
  });
});
