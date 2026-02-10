import Joi from "joi";

import { defineMessages } from "@/i18n/message";

export type SignInFormType = {
  login: string;
  password: string;
};

export class SignInForm {
  static messages = defineMessages({
    loginRequired: {
      id: "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      defaultMessage: "Required",
    },
    passwordRequired: {
      id: "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      defaultMessage: "Required",
    },
  });

  static schema = Joi.object({
    login: Joi.string().required().messages({
      "string.empty": this.messages.loginRequired.id,
      "any.required": this.messages.loginRequired.id,
    }),
    password: Joi.string().required().messages({
      "string.empty": this.messages.passwordRequired.id,
      "any.required": this.messages.passwordRequired.id,
    }),
  });

  static getDefault(): SignInFormType {
    return {
      login: "",
      password: "",
    };
  }
}
