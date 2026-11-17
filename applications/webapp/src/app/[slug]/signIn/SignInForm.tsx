import Joi from "joi";
import type { ParseKeys } from "i18next";

export type SignInFormType = {
  login: string;
  password: string;
};

export class SignInForm {
  static schema = Joi.object({
    login: Joi.string()
      .required()
      .messages({
        "string.empty": "[slug].signIn.SignInForm.loginRequired",
        "any.required": "[slug].signIn.SignInForm.loginRequired",
      } as Record<string, ParseKeys>),
    password: Joi.string()
      .required()
      .messages({
        "string.empty": "[slug].signIn.SignInForm.passwordRequired",
        "any.required": "[slug].signIn.SignInForm.passwordRequired",
      } as Record<string, ParseKeys>),
  });

  static getDefault(): SignInFormType {
    return {
      login: "",
      password: "",
    };
  }
}
