import Joi from "joi";

export const updateSubmissionFormSchema = Joi.object({
  answer: Joi.string().required().messages({
    "string.empty": "answer.required",
    "any.required": "answer.required",
  }),
});
