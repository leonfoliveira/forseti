import Joi from "joi";

export const updateSubmissionFormSchema = Joi.object({
  answer: Joi.string().required().messages({
    "any.required": "answer.required",
    "string.empty": "answer.required",
  }),
});
