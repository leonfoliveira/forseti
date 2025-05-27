import Joi from "joi";

export const submissionFormSchema = Joi.object({
  problemId: Joi.number().required().messages({
    "any.required": "Problem is required",
  }),
  language: Joi.string().required().messages({
    "string.empty": "Language is required",
    "any.required": "Language is required",
  }),
  code: Joi.any().required().messages({
    "any.required": "Code is required",
  }),
});
