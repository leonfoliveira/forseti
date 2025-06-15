import Joi from "joi";

export const memberSignInFormSchema = Joi.object({
  login: Joi.string().required().messages({
    "string.empty": "login:required",
    "any.required": "login:required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "password:required",
    "any.required": "password:required",
  }),
});
