import Joi from "joi";
import { defineMessages } from "react-intl";

export const messages = defineMessages({
  textRequired: {
    id: "app.contests.[slug]._common._form.announcement-form.text-required",
    defaultMessage: "Required",
  },
  textLong: {
    id: "app.contests.[slug]._common._form.announcement-form.text-long",
    defaultMessage: "Cannot exceed 255 characters",
  },
});

export const announcementFormSchema = Joi.object({
  text: Joi.string().required().max(255).messages({
    "any.required": messages.textRequired.id,
    "string.empty": messages.textRequired.id,
    "string.max": messages.textRequired.id,
  }),
});
