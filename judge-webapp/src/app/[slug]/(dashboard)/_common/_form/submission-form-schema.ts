import Joi from "joi";

import { defineMessages } from "@/i18n/message";

export const messages = defineMessages({
  problemRequired: {
    id: "app.[slug].(dashboard)._common._form.submission-form-schema.problem-required",
    defaultMessage: "Required",
  },
  languageRequired: {
    id: "app.[slug].(dashboard)._common._form.submission-form-schema.language-required",
    defaultMessage: "Required",
  },
  codeRequired: {
    id: "app.[slug].(dashboard)._common._form.submission-form-schema.code-required",
    defaultMessage: "Required",
  },
  codeTooLarge: {
    id: "app.[slug].(dashboard)._common._form.submission-form-schema.code-too-large",
    defaultMessage: "Code file must be at most 10MB",
  },
});

export const submissionFormSchema = Joi.object({
  problemId: Joi.string().required().messages({
    "any.required": messages.problemRequired.id,
    "string.empty": messages.problemRequired.id,
  }),
  language: Joi.string().required().messages({
    "any.required": messages.languageRequired.id,
    "string.empty": messages.languageRequired.id,
  }),
  code: Joi.custom((value: File[], helpers) => {
    if (value.length === 0) {
      return helpers.error("file.required");
    }
    if (value[0].size > 10 * 1024 * 1024) {
      return helpers.error("file.too-large");
    }
    return value;
  }).messages({
    "file.required": messages.codeRequired.id,
    "file.too-large": messages.codeTooLarge.id,
  }),
});
