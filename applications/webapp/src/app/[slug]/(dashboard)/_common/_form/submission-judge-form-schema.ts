import Joi from "joi";

import { defineMessages } from "@/i18n/message";

export const messages = defineMessages({
  answerRequired: {
    id: "app.[slug].(dashboard)._common._form.submission-judge-form-schema.answer-required",
    defaultMessage: "Required",
  },
});

export const submissionJudgeFormSchema = Joi.object({
  answer: Joi.string().required().messages({
    "any.required": messages.answerRequired.id,
    "string.empty": messages.answerRequired.id,
  }),
});
