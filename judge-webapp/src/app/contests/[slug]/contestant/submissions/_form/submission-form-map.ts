import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionForm } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form";

export function toInputDTO(
  submission: SubmissionForm,
): CreateSubmissionInputDTO {
  return {
    language: submission.language as Language,
    code: submission.code as File,
  };
}
