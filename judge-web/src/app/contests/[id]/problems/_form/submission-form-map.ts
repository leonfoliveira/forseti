import { SubmissionFormType } from "@/app/contests/[id]/problems/_form/submission-form-type";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { Language } from "@/core/domain/enumerate/Language";

export function toInputDTO(
  submission: SubmissionFormType,
): CreateSubmissionInputDTO {
  return {
    language: submission.language as Language,
    code: submission.code as File,
  };
}
