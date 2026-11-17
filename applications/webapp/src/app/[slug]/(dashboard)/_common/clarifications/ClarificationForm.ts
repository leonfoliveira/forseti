import Joi from "joi";
import type { ParseKeys } from "i18next";

import { CreateClarificationRequestDTO } from "@/port/dto/request/clarification/CreateClarificationRequestDTO";

export type ClarificationFormType = {
  problemId: string;
  text: string;
};

export class ClarificationForm {
  static schema = Joi.object({
    problemId: Joi.string().optional(),
    text: Joi.string()
      .required()
      .max(500)
      .messages({
        "any.required":
          "[slug].(dashboard)._common.clarifications.ClarificationForm.textRequired",
        "string.empty":
          "[slug].(dashboard)._common.clarifications.ClarificationForm.textRequired",
        "string.max":
          "[slug].(dashboard)._common.clarifications.ClarificationForm.textTooLong",
      } as Record<string, ParseKeys>),
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
