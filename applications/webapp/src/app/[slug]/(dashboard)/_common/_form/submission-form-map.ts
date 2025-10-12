import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";

export class SubmissionFormMap {
  static toInputDTO(data: SubmissionFormType): CreateSubmissionInputDTO {
    return {
      problemId: data.problemId,
      language: data.language,
      code: data.code[0],
    };
  }

  static getDefault(): SubmissionFormType {
    return {
      problemId: undefined,
      language: undefined,
      code: undefined,
    } as unknown as SubmissionFormType;
  }
}
