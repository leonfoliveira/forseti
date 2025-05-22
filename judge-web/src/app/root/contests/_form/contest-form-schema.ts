import Joi from "joi";

export const contestFormSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  languages: Joi.array().items(Joi.string()).required().messages({
    "array.empty": "At least one language is required",
    "any.required": "At least one language is required",
  }),
  startAt: Joi.date().greater("now").required().messages({
    "date.greater": "Start at must be in the future",
    "any.required": "Start at is required",
  }),
  endAt: Joi.date().greater(Joi.ref("startAt")).required().messages({
    "date.greater": "End at must be after start at",
    "any.required": "End at is required",
  }),
  members: Joi.array()
    .items(
      Joi.object({
        _id: Joi.number().optional(),
        type: Joi.string().required().messages({
          "string.empty": "Type is required",
          "any.required": "Type is required",
        }),
        name: Joi.string().required().messages({
          "string.empty": "Name is required",
          "any.required": "Name is required",
        }),
        login: Joi.string().required().messages({
          "string.empty": "Login is required",
          "any.required": "Login is required",
        }),
        password: Joi.when("_id", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.string().required().messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
          }),
        }),
      }).unknown(true),
    )
    .required(),
  problems: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().messages({
          "string.empty": "Title is required",
          "any.required": "Title is required",
        }),
        description: Joi.string().required().messages({
          "string.empty": "Description is required",
          "any.required": "Description is required",
        }),
        timeLimit: Joi.number().min(1).required().messages({
          "number.base": "Time limit is required",
          "number.min": "Time limit must be greater than 0",
          "any.required": "Time limit is required",
        }),
        testCases: Joi.any().when("_id", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required().messages({
            "any.required": "Test cases are required",
          }),
        }),
      }).unknown(true),
    )
    .required(),
}).unknown(true);
