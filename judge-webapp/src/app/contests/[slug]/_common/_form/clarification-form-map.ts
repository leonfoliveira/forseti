import { ClarificationFormType } from "@/app/contests/[slug]/_common/_form/clarification-form";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";

export class ClarificationFormMap {
  static toInputDTO(
    data: ClarificationFormType,
  ): CreateClarificationRequestDTO {
    return {
      parentId: !!data.parentId ? data.parentId : undefined,
      problemId: !!data.problemId ? data.problemId : undefined,
      text: data.text as string,
    };
  }
}
