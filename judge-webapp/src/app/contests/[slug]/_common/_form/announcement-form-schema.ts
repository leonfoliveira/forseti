import Joi from "joi";
import { defineMessages } from "react-intl";

export const messages = defineMessages({
  textRequired: {
    id: "app.contests.[slug]._common._form.announcement-form.text-required",
    defaultMessage: "Enter a text",
  },
});

export const announcementFormSchema = Joi.object({
  text: Joi.string().required().messages({
    "any.required": messages.textRequired.id,
    "string.empty": messages.textRequired.id,
  }),
});
