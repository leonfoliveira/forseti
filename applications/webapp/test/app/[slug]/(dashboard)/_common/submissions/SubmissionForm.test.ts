import { SubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionForm";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";

describe("SubmissionForm", () => {
  it("provides default form values and maps a selected file to the input DTO", () => {
    expect(SubmissionForm.getDefault()).toMatchObject({ problemId: "", language: "", code: "" });
    const file = new File(["code"], "solution.cpp");
    expect(SubmissionForm.toInputDTO({
      problemId: "problem-1",
      language: SubmissionLanguage.CPP_17,
      code: [file],
    })).toEqual({ problemId: "problem-1", language: SubmissionLanguage.CPP_17, code: file });
  });

  it("requires a nonempty code file no larger than 10 MB", () => {
    const data = { problemId: "problem-1", language: SubmissionLanguage.CPP_17, code: [new File(["ok"], "main.cpp")] };
    expect(SubmissionForm.schema.validate(data).error).toBeUndefined();
    expect(SubmissionForm.schema.validate({ ...data, code: [] }).error?.message).toContain("Code is Required");
  });
});
