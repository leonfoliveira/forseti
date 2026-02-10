import Joi from "joi";

import { CreateClarificationRequestDTO } from "@/core/port/dto/request/CreateClarificationRequestDTO";
import { defineMessages } from "@/i18n/message";

export type ClarificationAnswerFormType = {
  text: string;
};

export class ClarificationAnswerForm {
  static messages = defineMessages({
    textRequired: {
      id: "app.[slug].(dashboard)._common._form.clarification-answer-form-schema.text-required",
      defaultMessage: "Required",
    },
    textLong: {
      id: "app.[slug].(dashboard)._common._form.clarification-answer-form-schema.text-long",
      defaultMessage: "Cannot exceed 255 characters",
    },
  });

  static schema = Joi.object({
    text: Joi.string().required().max(255).messages({
      "any.required": this.messages.textRequired.id,
      "string.empty": this.messages.textRequired.id,
      "string.max": this.messages.textLong.id,
    }),
  });

  static toInputDTO(
    data: ClarificationAnswerFormType,
    parentId: string,
  ): CreateClarificationRequestDTO {
    return {
      parentId,
      problemId: undefined,
      text: data.text,
    };
  }

  static getDefault(): ClarificationAnswerFormType {
    return {
      text: "",
    };
  }
}
