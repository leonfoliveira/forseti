import Joi from "joi";

export const memberSignInFormSchema = Joi.object({
  login: Joi.string().required().messages({
    "string.empty": "Login is required",
    "any.required": "Login is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

export const rootSignInFormSchema = Joi.object({
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
