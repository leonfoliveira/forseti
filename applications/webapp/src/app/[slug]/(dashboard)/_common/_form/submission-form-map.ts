import { SubmissionFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-form";
import { CreateSubmissionInputDTO } from "@/core/port/driving/usecase/submission/SubmissionWritter";

export class SubmissionFormMap {
  static toInputDTO(data: SubmissionFormType): CreateSubmissionInputDTO {
    console.log(data);
    return {
      problemId: data.problemId,
      language: data.language,
      code: data.code[0],
    };
  }

  static getDefault(): SubmissionFormType {
    return {
      problemId: "",
      language: "",
      code: "",
    } as unknown as SubmissionFormType;
  }
}
