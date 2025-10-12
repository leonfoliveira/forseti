import { now, getLocalTimeZone, ZonedDateTime } from "@internationalized/date";
import Joi from "joi";

import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  slugRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.slug-required",
    defaultMessage: "Slug is required",
  },
  slugTooLong: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.slug-too-long",
    defaultMessage: "Slug must be at most 32 characters long",
  },
  slugPattern: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.slug-pattern",
    defaultMessage:
      "Slug must only contain alphanumeric characters and hyphens",
  },
  titleRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.title-required",
    defaultMessage: "Title is required",
  },
  titleTooLong: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.title-too-long",
    defaultMessage: "Title must be at most 255 characters long",
  },
  languagesRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.languages-required",
    defaultMessage: "At least one language is required",
  },
  startRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.start-required",
    defaultMessage: "Start date is required",
  },
  startFuture: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.start-future",
    defaultMessage: "Start date must be in the future",
  },
  endRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.end-required",
    defaultMessage: "End date is required",
  },
  endAfterStart: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.end-after-start",
    defaultMessage: "End date must be after start date",
  },
  problemTitleRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-title-required",
    defaultMessage: "Title is required",
  },
  problemTitleTooLong: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-title-too-long",
    defaultMessage: "Title must be at most 255 characters long",
  },
  problemDescriptionRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-description-required",
    defaultMessage: "Description is required",
  },
  problemDescriptionSize: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-description-size",
    defaultMessage: "Description file must be at most 10MB",
  },
  problemTimeLimitRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-time-limit-required",
    defaultMessage: "Time limit is required",
  },
  problemTimeLimitPositive: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-time-limit-positive",
    defaultMessage: "Time limit must be a positive number",
  },
  problemMemoryLimitRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-memory-limit-required",
    defaultMessage: "Memory limit is required",
  },
  problemMemoryLimitPositive: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-memory-limit-positive",
    defaultMessage: "Memory limit must be a positive number",
  },
  problemTestCasesRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-test-cases-required",
    defaultMessage: "Test cases are required",
  },
  problemTestCasesSize: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-test-cases-size",
    defaultMessage: "Test cases file must be at most 10MB",
  },
  problemTestCasesFormat: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.problem-test-cases-format",
    defaultMessage: "Test cases file must be in CSV format",
  },
  memberTypeRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-type-required",
    defaultMessage: "Type is required",
  },
  memberNameRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-name-required",
    defaultMessage: "Name is required",
  },
  memberNameTooLong: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-name-too-long",
    defaultMessage: "Name must be at most 64 characters long",
  },
  memberLoginRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-login-required",
    defaultMessage: "Login is required",
  },
  memberLoginTooLong: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-login-too-long",
    defaultMessage: "Login must be at most 32 characters long",
  },
  memberPasswordRequired: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-password-required",
    defaultMessage: "Password is required",
  },
  memberPasswordTooLong: {
    id: "app.[slug].(dashboard).settings._form.settings-form-schema.member-password-too-long",
    defaultMessage: "Password must be at most 32 characters long",
  },
});

export const settingsFormSchema = (contestStatus: ContestStatus) =>
  Joi.object({
    slug: Joi.string()
      .min(1)
      .max(32)
      .pattern(/^[a-zA-Z0-9-]+$/)
      .required()
      .messages({
        "any.required": messages.slugRequired.id,
        "string.empty": messages.slugRequired.id,
        "string.min": messages.slugRequired.id,
        "string.max": messages.slugTooLong.id,
        "string.pattern.base": messages.slugPattern.id,
      }),
    title: Joi.string().min(1).max(255).required().messages({
      "any.required": messages.titleRequired.id,
      "string.empty": messages.titleRequired.id,
      "string.min": messages.titleRequired.id,
      "string.max": messages.titleTooLong.id,
    }),
    languages: Joi.array().min(1).required().messages({
      "any.required": messages.languagesRequired.id,
      "array.min": messages.languagesRequired.id,
    }),
    startAt: Joi.custom((value: ZonedDateTime, helpers) => {
      try {
        // Skip future validation if contest is not in NOT_STARTED status
        if (contestStatus !== ContestStatus.NOT_STARTED) {
          return value;
        }

        const currentTime = now(getLocalTimeZone());
        if (value.compare(currentTime) <= 0) {
          return helpers.error("calendar-date-time.future");
        }
      } catch {
        return helpers.error("calendar-date-time.invalid");
      }

      return value;
    })
      .required()
      .messages({
        "any.required": messages.startRequired.id,
        "calendar-date-time.invalid": messages.startRequired.id,
        "calendar-date-time.future": messages.startFuture.id,
      }),
    endAt: Joi.when("startAt", {
      is: Joi.exist(),
      then: Joi.custom((value: ZonedDateTime, helpers) => {
        const startValue = helpers.state.ancestors[0].startAt as ZonedDateTime;
        if (startValue && value.compare(startValue) <= 0) {
          return helpers.error("calendar-date-time.after-start");
        }
        return value;
      }),
    })
      .required()
      .messages({
        "any.required": messages.endRequired.id,
        "calendar-date-time.invalid": messages.endRequired.id,
        "calendar-date-time.after-start": messages.endAfterStart.id,
      }),
    problems: Joi.array()
      .items(
        Joi.object({
          _id: Joi.string(),
          title: Joi.string().min(1).max(255).required().messages({
            "any.required": messages.problemTitleRequired.id,
            "string.empty": messages.problemTitleRequired.id,
            "string.min": messages.problemTitleRequired.id,
            "string.max": messages.problemTitleTooLong.id,
          }),
          newDescription: Joi.when("_id", {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.custom((value: File[], helpers) => {
              if (value.length === 0) {
                return helpers.error("file.required");
              }
              if (value[0].size > 10 * 1024 * 1024) {
                return helpers.error("file.too-large");
              }
              return value;
            }).required(),
          }).messages({
            "any.required": messages.problemDescriptionRequired.id,
            "file.required": messages.problemDescriptionRequired.id,
            "file.too-large": messages.problemDescriptionSize.id,
          }),
          timeLimit: Joi.number().min(1).required().messages({
            "any.required": messages.problemTimeLimitRequired.id,
            "number.min": messages.problemTimeLimitPositive.id,
          }),
          memoryLimit: Joi.number().min(1).required().messages({
            "any.required": messages.problemMemoryLimitRequired.id,
            "number.min": messages.problemMemoryLimitPositive.id,
          }),
          newTestCases: Joi.when("_id", {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.custom((value: File[], helpers) => {
              if (value.length === 0) {
                return helpers.error("file.required");
              }
              if (value[0].size > 10 * 1024 * 1024) {
                return helpers.error("file.too-large");
              }
              if (value[0].type !== "text/csv") {
                return helpers.error("file.invalid-type");
              }
              return value;
            }).required(),
          }).messages({
            "any.required": messages.problemTestCasesRequired.id,
            "file.required": messages.problemTestCasesRequired.id,
            "file.too-large": messages.problemTestCasesSize.id,
            "file.invalid-type": messages.problemTestCasesFormat.id,
          }),
        }).unknown(),
      )
      .required(),
    members: Joi.array()
      .items(
        Joi.object({
          _id: Joi.string(),
          type: Joi.string().required().messages({
            "any.required": messages.memberTypeRequired.id,
            "string.empty": messages.memberTypeRequired.id,
          }),
          name: Joi.string().min(1).max(64).required().messages({
            "any.required": messages.memberNameRequired.id,
            "string.empty": messages.memberNameRequired.id,
            "string.min": messages.memberNameRequired.id,
            "string.max": messages.memberNameTooLong.id,
          }),
          login: Joi.string().min(1).max(32).required().messages({
            "any.required": messages.memberLoginRequired.id,
            "string.empty": messages.memberLoginRequired.id,
            "string.min": messages.memberLoginRequired.id,
            "string.max": messages.memberLoginTooLong.id,
          }),
          password: Joi.string()
            .min(1)
            .max(32)
            .when("_id", {
              is: Joi.exist(),
              then: Joi.allow("").optional(),
              otherwise: Joi.required(),
            })
            .messages({
              "any.required": messages.memberPasswordRequired.id,
              "string.empty": messages.memberPasswordRequired.id,
              "string.min": messages.memberPasswordRequired.id,
              "string.max": messages.memberPasswordTooLong.id,
            }),
        }).unknown(),
      )
      .required(),
  }).unknown();
