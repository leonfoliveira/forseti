import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";

export class ClarificationFormMap {
  static toInputDTO(
    data: ClarificationFormType,
  ): CreateClarificationRequestDTO {
    return {
      parentId: !!data.parentId ? data.parentId : undefined,
      problemId: !!data.problemId ? data.problemId : undefined,
      text: data.text,
    };
  }

  static getDefault(): ClarificationFormType {
    return {
      parentId: undefined,
      problemId: undefined,
      text: "",
    };
  }
}
