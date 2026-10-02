import Joi from "joi";

export type SignInFormType = {
  login: string;
  password: string;
};

export class SignInForm {
  static schema = Joi.object({
    login: Joi.string().required().messages({
      "string.empty": "Login is required",
      "any.required": "Login is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  });

  static getDefault(): SignInFormType {
    return {
      login: "",
      password: "",
    };
  }
}
