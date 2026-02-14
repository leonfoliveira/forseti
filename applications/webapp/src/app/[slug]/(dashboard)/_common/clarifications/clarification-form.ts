import Joi from "joi";

import { CreateClarificationRequestDTO } from "@/core/port/dto/request/CreateClarificationRequestDTO";
import { defineMessages } from "@/i18n/message";

export type ClarificationFormType = {
  problemId: string;
  text: string;
};

export class ClarificationForm {
  static messages = defineMessages({
    problemRequired: {
      id: "app.[slug].(dashboard)._common.clarifications.clarification-form.problem-required",
      defaultMessage: "Required",
    },
    textRequired: {
      id: "app.[slug].(dashboard)._common.clarifications.clarification-form.text-required",
      defaultMessage: "Required",
    },
    textLong: {
      id: "app.[slug].(dashboard)._common.clarifications.clarification-form.text-long",
      defaultMessage: "Cannot exceed 255 characters",
    },
  });

  static schema = Joi.object({
    problemId: Joi.string().required().messages({
      "any.required": this.messages.problemRequired.id,
      "string.empty": this.messages.problemRequired.id,
    }),
    text: Joi.string().required().max(255).messages({
      "any.required": this.messages.textRequired.id,
      "string.empty": this.messages.textRequired.id,
      "string.max": this.messages.textLong.id,
    }),
  });

  static toInputDTO(
    data: ClarificationFormType,
  ): CreateClarificationRequestDTO {
    return {
      parentId: undefined,
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
