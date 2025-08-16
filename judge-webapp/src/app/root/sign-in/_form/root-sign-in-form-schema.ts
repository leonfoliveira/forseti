import Joi from "joi";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  passwordRequired: {
    id: "app.root.sign-in._form.root-sign-in-form-schema.password-required",
    defaultMessage: "Required",
  },
});

export const rootSignInFormSchema = Joi.object({
  password: Joi.string().required().messages({
    "string.empty": messages.passwordRequired.id,
    "any.required": messages.passwordRequired.id,
  }),
});
