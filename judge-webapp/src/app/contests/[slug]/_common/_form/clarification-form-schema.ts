import Joi from "joi";

export const clarificationFormSchema = Joi.object({
  problemId: Joi.string().allow("").optional(),
  parentId: Joi.string().allow("").optional(),
  text: Joi.string().required().messages({
    "any.required": "text:required",
    "string.empty": "text:required",
  }),
});
