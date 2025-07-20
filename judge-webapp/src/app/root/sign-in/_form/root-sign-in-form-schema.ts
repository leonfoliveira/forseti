import Joi from "joi";

export type RootSignInFormType = {
  password: string;
};

export const rootSignInFormSchema = Joi.object({
  password: Joi.string().required().messages({
    "string.empty": "password:required",
    "any.required": "password:required",
  }),
});
