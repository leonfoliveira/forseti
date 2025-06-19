import Joi from "joi";

export const announcementFormSchema = Joi.object({
  text: Joi.string().required().messages({
    "any.required": "text:required",
    "string.empty": "text:required",
  }),
});
