import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionFormType } from "@/app/contests/[slug]/contestant/submissions/_form/submission-form";

export class SubmissionFormMap {
  static toInputDTO(submission: SubmissionFormType): CreateSubmissionInputDTO {
    return {
      language: submission.language as Language,
      code: submission.code as File,
    };
  }
}
