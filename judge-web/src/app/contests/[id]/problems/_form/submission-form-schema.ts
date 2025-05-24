import Joi from "joi";

export const submissionFormSchema = Joi.object({
  language: Joi.string().required().messages({
    "string.empty": "Language is required",
    "any.required": "Language is required",
  }),
  code: Joi.any().required().messages({
    "any.required": "Code is required",
  }),
});
