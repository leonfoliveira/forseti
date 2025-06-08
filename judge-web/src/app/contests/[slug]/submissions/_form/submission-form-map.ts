import { SubmissionFormType } from "@/app/contests/[slug]/submissions/_form/submission-form-type";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { Language } from "@/core/domain/enumerate/Language";

export function toInputDTO(
  submission: SubmissionFormType,
): CreateSubmissionInputDTO {
  return {
    problemId: submission.problemId as string,
    language: submission.language as Language,
    code: submission.code as File,
  };
}
