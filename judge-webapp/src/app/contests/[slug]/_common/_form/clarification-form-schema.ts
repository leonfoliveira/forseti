import Joi from "joi";
import { defineMessages } from "react-intl";

export const messages = defineMessages({
  textRequired: {
    id: "contests.[slug]._common._form.clarification-form.text-required",
    defaultMessage: "Enter a text",
  },
});

export const clarificationFormSchema = Joi.object({
  problemId: Joi.string().allow("").optional(),
  parentId: Joi.string().allow("").optional(),
  text: Joi.string().required().messages({
    "any.required": messages.textRequired.id,
    "string.empty": messages.textRequired.id,
  }),
});
