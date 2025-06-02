import Joi from "joi";

export const submissionFormSchema = Joi.object({
  problemId: Joi.number().required().messages({
    "any.required": "problem.required",
  }),
  language: Joi.string().required().messages({
    "string.empty": "language.required",
    "any.required": "language.required",
  }),
  code: Joi.custom((value: File, helpers) => {
    if (value.size > 10 * 1024 * 1024) {
      return helpers.error("file.size");
    }
    return value;
  })
    .required()
    .messages({
      "any.required": "code.required",
      "file.size": "code.size",
    }),
});
