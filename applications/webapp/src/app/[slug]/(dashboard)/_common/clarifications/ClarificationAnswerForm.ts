import Joi from "joi";

import { AnswerClarificationRequestDTO } from "@/port/dto/request/clarification/AnswerClarificationRequestDTO";

export type ClarificationAnswerFormType = {
  text: string;
};

export class ClarificationAnswerForm {
  static schema = Joi.object({
    text: Joi.string().required().max(255).messages({
      "any.required": "Text is required",
      "string.empty": "Text is required",
      "string.max": "Text cannot exceed 255 characters",
    }),
  });

  static toInputDTO(
    data: ClarificationAnswerFormType,
  ): AnswerClarificationRequestDTO {
    return {
      text: data.text,
    };
  }

  static getDefault(): ClarificationAnswerFormType {
    return {
      text: "",
    };
  }
}
