import { SubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionForm";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";

describe("SubmissionForm", () => {
  const validData = {
    problemId: "problem-1",
    language: SubmissionLanguage.CPP_17,
    code: [new File(["code"], "solution.cpp")],
  };

  describe("schema", () => {
    it("validates correct data", () => {
      expect(SubmissionForm.schema.validate(validData).error).toBeUndefined();
    });

    it("validates problemId", () => {
      expect(
        SubmissionForm.schema.validate({ ...validData, problemId: undefined })
          .error?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.problemRequired",
      );
      expect(
        SubmissionForm.schema.validate({ ...validData, problemId: "" }).error
          ?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.problemRequired",
      );
    });

    it("validates language", () => {
      expect(
        SubmissionForm.schema.validate({ ...validData, language: undefined })
          .error?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.languageRequired",
      );
      expect(
        SubmissionForm.schema.validate({ ...validData, language: "" }).error
          ?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.languageRequired",
      );
    });

    it("validates code", () => {
      expect(
        SubmissionForm.schema.validate({ ...validData, code: undefined }).error
          ?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.codeRequired",
      );
      expect(
        SubmissionForm.schema.validate({ ...validData, code: [] }).error
          ?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.codeRequired",
      );
      const mockedFile = jest.mocked(File);
      (mockedFile as any).size = 10 * 1024 * 1024 + 1;
      expect(
        SubmissionForm.schema.validate({ ...validData, code: [mockedFile] })
          .error?.message,
      ).toContain(
        "[slug].(dashboard)._common.submissions.SubmissionForm.codeTooLarge",
      );
    });
  });

  describe("toInputDTO", () => {
    it("converts valid data to input DTO", () => {
      const inputDTO = SubmissionForm.toInputDTO(validData);
      expect(inputDTO).toEqual({
        problemId: validData.problemId,
        language: validData.language,
        code: validData.code[0],
      });
    });
  });

  describe("getDefault", () => {
    it("returns default data", () => {
      const defaultData = SubmissionForm.getDefault();
      expect(defaultData).toEqual({
        problemId: "",
        language: "",
        code: "",
      });
    });
  });
});
