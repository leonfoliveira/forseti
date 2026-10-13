import Joi from "joi";

import { CreateClarificationRequestDTO } from "@/port/dto/request/CreateClarificationRequestDTO";

export type ClarificationFormType = {
  problemId: string;
  text: string;
};

export class ClarificationForm {
  static schema = Joi.object({
    problemId: Joi.string().optional(),
    text: Joi.string().required().max(500).messages({
      "any.required": "Text is required",
      "string.empty": "Text is required",
      "string.max": "Cannot exceed 500 characters",
    }),
  });

  static toInputDTO(
    data: ClarificationFormType,
  ): CreateClarificationRequestDTO {
    return {
      problemId: data.problemId === "__none__" ? undefined : data.problemId,
      text: data.text,
    };
  }

  static getDefault(): ClarificationFormType {
    return {
      problemId: "__none__",
      text: "",
    };
  }
}
