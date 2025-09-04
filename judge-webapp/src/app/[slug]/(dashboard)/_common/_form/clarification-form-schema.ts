import Joi from "joi";

import { defineMessages } from "@/i18n/message";

export const messages = defineMessages({
  textRequired: {
    id: "app.[slug].(dashboard)._common._form.clarification-form-schema.text-required",
    defaultMessage: "Required",
  },
  textLong: {
    id: "app.[slug].(dashboard)._common._form.clarification-form-schema.text-long",
    defaultMessage: "Cannot exceed 255 characters",
  },
});

export const clarificationFormSchema = Joi.object({
  problemId: Joi.string().allow("").optional(),
  parentId: Joi.string().allow("").optional(),
  text: Joi.string().required().max(255).messages({
    "any.required": messages.textRequired.id,
    "string.empty": messages.textRequired.id,
    "string.max": messages.textLong.id,
  }),
});
