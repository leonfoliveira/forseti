import Joi from "joi";

export const submissionFormSchema = Joi.object({
  problemId: Joi.number().required().messages({
    "any.required": "problem.required",
  }),
  language: Joi.string().required().messages({
    "string.empty": "language.required",
    "any.required": "language.required",
  }),
  code: Joi.any().required().messages({
    "any.required": "code.required",
  }),
});
