import Joi from "joi";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  slugRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.slug-required",
    defaultMessage: "Required",
  },
  slugMax: {
    id: "app.root.(dashboard)._form.contest-form-schema.slug-max",
    defaultMessage: "Cannot exceed 32 characters",
  },
  slugPattern: {
    id: "app.root.(dashboard)._form.contest-form-schema.slug-pattern",
    defaultMessage: "Must contain only letters, numbers, and hyphens",
  },
  titleRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.title-required",
    defaultMessage: "Required",
  },
  titleMax: {
    id: "app.root.(dashboard)._form.contest-form-schema.title-max",
    defaultMessage: "Cannot exceed 255 characters",
  },
  languagesRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.languages-required",
    defaultMessage: "At least one language is required",
  },
  startAtRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.start-at-required",
    defaultMessage: "Required",
  },
  startAtGreaterNow: {
    id: "app.root.(dashboard)._form.contest-form-schema.start-at-greater-now",
    defaultMessage: "Must be in the future",
  },
  endAtRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.end-at-required",
    defaultMessage: "Required",
  },
  endAtGreaterStartAt: {
    id: "app.root.(dashboard)._form.contest-form-schema.end-at-greater-start-at",
    defaultMessage: "Must be after start time",
  },
  endAtGreaterNow: {
    id: "app.root.(dashboard)._form.contest-form-schema.end-at-greater-now",
    defaultMessage: "Must be in the future",
  },
  memberTypeRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-type-required",
    defaultMessage: "Required",
  },
  memberNameRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-name-required",
    defaultMessage: "Required",
  },
  memberNameMax: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-name-max",
    defaultMessage: "Cannot exceed 64 characters",
  },
  memberLoginRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-login-required",
    defaultMessage: "Required",
  },
  memberLoginMax: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-login-max",
    defaultMessage: "Cannot exceed 32 characters",
  },
  memberPasswordRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-password-required",
    defaultMessage: "Required",
  },
  memberPasswordMax: {
    id: "app.root.(dashboard)._form.contest-form-schema.member-password-max",
    defaultMessage: "Cannot exceed 32 characters",
  },
  problemTitleRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-title-required",
    defaultMessage: "Required",
  },
  problemTitleMax: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-title-max",
    defaultMessage: "Cannot exceed 255 characters",
  },
  problemDescriptionRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-description-required",
    defaultMessage: "Required",
  },
  problemDescriptionSize: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-description-size",
    defaultMessage: "Must be smaller than 10MB",
  },
  problemTimeLimitRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-time-limit-required",
    defaultMessage: "Required",
  },
  problemTimeLimitMin: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-time-limit-min",
    defaultMessage: "Must be at least 1",
  },
  problemMemoryLimitRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-memory-limit-required",
    defaultMessage: "Required",
  },
  problemMemoryLimitMin: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-memory-limit-min",
    defaultMessage: "Must be at least 1",
  },
  problemTestCasesRequired: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-test-cases-required",
    defaultMessage: "Required",
  },
  problemTestCasesSize: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-test-cases-size",
    defaultMessage: "Must be smaller than 10MB",
  },
  problemTestCasesContentType: {
    id: "app.root.(dashboard)._form.contest-form-schema.problem-test-cases-content-type",
    defaultMessage: "Must be a CSV file",
  },
});

export const contestFormSchema = Joi.object({
  slug: Joi.string()
    .required()
    .max(32)
    .pattern(/^[a-zA-Z0-9\-]+$/)
    .messages({
      "string.empty": messages.slugRequired.id,
      "any.required": messages.slugRequired.id,
      "string.max": messages.slugMax.id,
      "string.pattern.base": messages.slugPattern.id,
    }),
  title: Joi.string().required().max(255).messages({
    "string.empty": messages.titleRequired.id,
    "any.required": messages.titleRequired.id,
    "string.max": messages.titleMax.id,
  }),
  languages: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.empty": messages.languagesRequired.id,
    "array.min": messages.languagesRequired.id,
    "any.required": messages.languagesRequired.id,
  }),
  startAt: Joi.date()
    .required()
    .greater("now")
    .when("originalStartAt", {
      is: Joi.date().greater("now").optional(),
      then: Joi.date().greater("now").messages({
        "date.greater": messages.startAtGreaterNow.id,
      }),
    })
    .messages({
      "any.required": messages.startAtRequired.id,
      "date.greater": messages.startAtGreaterNow.id,
    }),
  endAt: Joi.date()
    .greater(Joi.ref("startAt"))
    .messages({
      "date.greater": messages.endAtGreaterStartAt.id,
    })
    .greater("now")
    .messages({
      "date.greater": messages.endAtGreaterNow.id,
    })
    .required()
    .messages({
      "any.required": messages.endAtRequired.id,
    }),
  members: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(),
        type: Joi.string().required().messages({
          "string.empty": messages.memberTypeRequired.id,
          "any.required": messages.memberTypeRequired.id,
        }),
        name: Joi.string().required().max(64).messages({
          "string.empty": messages.memberNameRequired.id,
          "any.required": messages.memberNameRequired.id,
          "string.max": messages.memberNameMax.id,
        }),
        login: Joi.string().required().max(32).messages({
          "string.empty": messages.memberLoginRequired.id,
          "any.required": messages.memberLoginRequired.id,
          "string.max": messages.memberLoginMax.id,
        }),
        password: Joi.when("_id", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.string().required().max(32).messages({
            "string.empty": messages.memberPasswordRequired.id,
            "any.required": messages.memberPasswordRequired.id,
            "string.max": messages.memberPasswordMax.id,
          }),
        }),
      }).unknown(true),
    )
    .required(),
  problems: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().max(255).messages({
          "string.empty": messages.problemTitleRequired.id,
          "any.required": messages.problemTitleRequired.id,
          "string.max": messages.problemTitleMax.id,
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
              "string.empty": messages.problemDescriptionRequired.id,
              "any.required": messages.problemDescriptionRequired.id,
              "file.size": messages.problemDescriptionSize.id,
            }),
        }),
        timeLimit: Joi.number().min(1).required().messages({
          "any.required": messages.problemTimeLimitRequired.id,
          "number.base": messages.problemTimeLimitRequired.id,
          "number.min": messages.problemTimeLimitMin.id,
        }),
        memoryLimit: Joi.number().min(1).required().messages({
          "any.required": messages.problemMemoryLimitRequired.id,
          "number.base": messages.problemMemoryLimitRequired.id,
          "number.min": messages.problemMemoryLimitMin.id,
        }),
        newTestCases: Joi.when("testCases", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.custom((value: File, helpers) => {
            if (value.size > 10 * 1024 * 1024) {
              return helpers.error("file.size");
            }

            if (value.type != "text/csv") {
              return helpers.error("file.type", {});
            }

            return value;
          })
            .required()
            .messages({
              "string.empty": messages.problemTestCasesRequired.id,
              "any.required": messages.problemTestCasesRequired.id,
              "file.size": messages.problemTestCasesSize.id,
              "file.type": messages.problemTestCasesContentType.id,
            }),
        }),
      }).unknown(true),
    )
    .required(),
}).unknown(true);
