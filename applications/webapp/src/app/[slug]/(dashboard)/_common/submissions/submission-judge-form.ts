import Joi from "joi";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { defineMessages } from "@/i18n/message";

export type SubmissionJudgeFormType = {
  answer: SubmissionAnswer;
};

export class SubmissionJudgeForm {
  static messages = defineMessages({
    answerRequired: {
      id: "app.[slug].(dashboard)._common._form.submission-judge-form-schema.answer-required",
      defaultMessage: "Required",
    },
  });

  static schema = Joi.object({
    answer: Joi.string().required().messages({
      "any.required": this.messages.answerRequired.id,
      "string.empty": this.messages.answerRequired.id,
    }),
  });

  static getDefault(): SubmissionJudgeFormType {
    return {
      answer: "",
    } as unknown as SubmissionJudgeFormType;
  }
}
