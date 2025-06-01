import Joi from "joi";

export const contestFormSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "title.required",
    "any.required": "title.required",
  }),
  languages: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.empty": "languages.required",
    "array.min": "languages.required",
    "any.required": "languages.required",
  }),
  startAt: Joi.date().greater("now").required().messages({
    "any.required": "start-at.required",
    "date.greater": "start-at.greater",
  }),
  endAt: Joi.date().greater(Joi.ref("startAt")).required().messages({
    "any.required": "end-at.required",
    "date.greater": "end-at.greater",
  }),
  members: Joi.array()
    .items(
      Joi.object({
        _id: Joi.number().optional(),
        type: Joi.string().required().messages({
          "string.empty": "member-type.required",
          "any.required": "member-type.required",
        }),
        name: Joi.string().required().messages({
          "string.empty": "member-name.required",
          "any.required": "member-name.required",
        }),
        login: Joi.string().required().messages({
          "string.empty": "member-login.required",
          "any.required": "member-login.required",
        }),
        password: Joi.when("_id", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.string().required().messages({
            "string.empty": "member-password.required",
            "any.required": "member-password.required",
          }),
        }),
      }).unknown(true),
    )
    .required(),
  problems: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().messages({
          "string.empty": "problem-title.required",
          "any.required": "problem-title.required",
        }),
        newDescription: Joi.when("description", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.any().required().messages({
            "string.empty": "problem-description.required",
            "any.required": "problem-description.required",
          }),
        }),
        timeLimit: Joi.number().min(1).required().messages({
          "any.required": "problem-time-limit.required",
          "number.base": "problem-time-limit.required",
          "number.min": "problem-time-limit.min",
        }),
        newTestCases: Joi.when("testCases", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.any().required().messages({
            "string.empty": "problem-test-cases.required",
            "any.required": "problem-test-cases.required",
          }),
        }),
      }).unknown(true),
    )
    .required(),
}).unknown(true);
