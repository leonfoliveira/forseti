import type { ParseKeys } from "i18next";
import Joi from "joi";

import { AnswerClarificationRequestDTO } from "@/port/dto/request/clarification/AnswerClarificationRequestDTO";

export type ClarificationAnswerFormType = {
  text: string;
};

export class ClarificationAnswerForm {
  static schema = Joi.object({
    text: Joi.string()
      .required()
      .max(255)
      .messages({
        "any.required":
          "[slug].(dashboard)._common.clarifications.ClarificationAnswerForm.textRequired",
        "string.empty":
          "[slug].(dashboard)._common.clarifications.ClarificationAnswerForm.textRequired",
        "string.max":
          "[slug].(dashboard)._common.clarifications.ClarificationAnswerForm.textTooLong",
      } as Record<string, ParseKeys>),
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
