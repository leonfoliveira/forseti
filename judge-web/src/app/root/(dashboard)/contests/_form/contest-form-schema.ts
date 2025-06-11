import Joi from "joi";
import { validateTestCases } from "@/app/root/(dashboard)/contests/_form/test-cases-validator";

export const contestFormSchema = Joi.object({
  slug: Joi.string()
    .required()
    .pattern(/[a-zA-Z0-9\-]/)
    .messages({
      "string.empty": "slug.required",
      "any.required": "slug.required",
      "string.pattern.base": "slug.pattern",
    }),
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
        _id: Joi.string().optional(),
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
        letter: Joi.string().required().length(1).messages({
          "string.empty": "problem-letter.required",
          "any.required": "problem-letter.required",
          "string.length": "problem-letter.length",
        }),
        title: Joi.string().required().messages({
          "string.empty": "problem-title.required",
          "any.required": "problem-title.required",
        }),
        newDescription: Joi.when("description", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.custom((value: File, helpers) => {
            if (value.size > 10 * 1024 * 1024) {
              return helpers.error("file.size");
            }
            return value;
          })
            .required()
            .messages({
              "string.empty": "problem-description.required",
              "any.required": "problem-description.required",
              "file.size": "problem-description.size",
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
          otherwise: Joi.custom(async (value: File, helpers) => {
            if (value.size > 10 * 1024 * 1024) {
              return helpers.error("file.size");
            }

            if (value.type != "text/csv") {
              return helpers.error("file.type");
            }

            if (!(await validateTestCases(value))) {
              return helpers.error("file.invalid");
            }

            return value;
          })
            .required()
            .messages({
              "string.empty": "problem-test-cases.required",
              "any.required": "problem-test-cases.required",
              "file.size": "problem-test-cases.size",
              "file.type": "problem-test-cases.content-type",
              "file.invalid": "problem-test-cases.invalid",
            }),
        }),
      }).unknown(true),
    )
    .required(),
}).unknown(true);
