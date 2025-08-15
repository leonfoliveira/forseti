import Joi from "joi";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  loginRequired: {
    id: "app.contests.[slug].sign-in._form.member-sign-in-form-schema.login-required",
    defaultMessage: "Required",
  },
  passwordRequired: {
    id: "app.contests.[slug].sign-in._form.member-sign-in-form-schema.password-required",
    defaultMessage: "Required",
  },
});

export const memberSignInFormSchema = Joi.object({
  login: Joi.string().required().messages({
    "string.empty": messages.loginRequired.id,
    "any.required": messages.loginRequired.id,
  }),
  password: Joi.string().required().messages({
    "string.empty": messages.passwordRequired.id,
    "any.required": messages.passwordRequired.id,
  }),
});
