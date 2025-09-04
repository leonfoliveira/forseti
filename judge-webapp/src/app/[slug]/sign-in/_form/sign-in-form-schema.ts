import Joi from "joi";

import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  loginRequired: {
    id: "app.[slug].sign-in._form.sign-in-form-schema.login-required",
    defaultMessage: "Required",
  },
  passwordRequired: {
    id: "app.[slug].sign-in._form.sign-in-form-schema.password-required",
    defaultMessage: "Required",
  },
});

export const signInFormSchema = Joi.object({
  login: Joi.string().required().messages({
    "string.empty": messages.loginRequired.id,
    "any.required": messages.loginRequired.id,
  }),
  password: Joi.string().required().messages({
    "string.empty": messages.passwordRequired.id,
    "any.required": messages.passwordRequired.id,
  }),
});
