import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { SubmissionFormMap } from "@/app/[slug]/(dashboard)/_common/_form/submission-form-map";
import { Language } from "@/core/domain/enumerate/Language";

describe("SubmissionFormMap", () => {
  it("should map to InputDTO", () => {
    const mockFile = new File(["test code"], "test.cpp", {
      type: "text/plain",
    });
    const data = {
      problemId: "problem-1",
      language: Language.CPP_17,
      code: [mockFile],
    } as SubmissionFormType;

    const inputDTO = SubmissionFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: "problem-1",
      language: Language.CPP_17,
      code: mockFile,
    });
  });

  it("should map to InputDTO with different language", () => {
    const mockFile = new File(["test code"], "test.java", {
      type: "text/plain",
    });
    const data = {
      problemId: "problem-2",
      language: Language.JAVA_21,
      code: [mockFile],
    } as SubmissionFormType;

    const inputDTO = SubmissionFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      problemId: "problem-2",
      language: Language.JAVA_21,
      code: mockFile,
    });
  });
});
