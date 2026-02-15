import Joi from "joi";

import { DateTimeUtil } from "@/app/_lib/util/datetime-util";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { UpdateContestInputDTO } from "@/core/port/driving/usecase/contest/ContestWritter";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { defineMessages } from "@/i18n/message";

export type SettingsFormType = {
  contest: {
    slug: string;
    title: string;
    languages: {
      [key in SubmissionLanguage]: boolean;
    };
    startAt: string;
    endAt: string;
    autoFreezeAt?: string;
    settings: {
      isAutoJudgeEnabled: boolean;
    };
  };
  problems: {
    _id?: string;
    title: string;
    description: AttachmentResponseDTO;
    newDescription?: File[];
    timeLimit: string;
    memoryLimit: string;
    testCases: AttachmentResponseDTO;
    newTestCases?: File[];
  }[];
  members: {
    _id?: string;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
  }[];
};

export class SettingsForm {
  static messages = defineMessages({
    slugRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.slug-required",
      defaultMessage: "Slug is required",
    },
    slugTooLong: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.slug-too-long",
      defaultMessage: "Slug must be at most 32 characters long",
    },
    slugPattern: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.slug-pattern",
      defaultMessage:
        "Slug must only contain alphanumeric characters and hyphens",
    },
    titleRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.title-required",
      defaultMessage: "Title is required",
    },
    titleTooLong: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.title-too-long",
      defaultMessage: "Title must be at most 255 characters long",
    },
    languagesRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.languages-required",
      defaultMessage: "At least one language is required",
    },
    startInvalid: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.start-invalid",
      defaultMessage: "Start date is invalid",
    },
    startRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.start-required",
      defaultMessage: "Start date is required",
    },
    startFuture: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.start-future",
      defaultMessage: "Start date must be in the future",
    },
    endInvalid: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.end-invalid",
      defaultMessage: "End date is invalid",
    },
    endRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.end-required",
      defaultMessage: "End date is required",
    },
    endAfterStart: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.end-after-start",
      defaultMessage: "End date must be after start date",
    },
    autoFreezeInvalid: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-invalid",
      defaultMessage: "Auto freeze date is invalid",
    },
    autoFreezeAfterStart: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-after-start",
      defaultMessage: "Auto freeze date must be after start date",
    },
    autoFreezeBeforeEnd: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-before-end",
      defaultMessage: "Auto freeze date must be before end date",
    },
    autoFreezeFuture: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.auto-freeze-future",
      defaultMessage: "Auto freeze date must be in the future",
    },
    problemTitleRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-title-required",
      defaultMessage: "Title is required",
    },
    problemTitleTooLong: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-title-too-long",
      defaultMessage: "Title must be at most 255 characters long",
    },
    problemDescriptionRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-description-required",
      defaultMessage: "Description is required",
    },
    problemDescriptionSize: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-description-size",
      defaultMessage: "Description file must be at most 10MB",
    },
    problemTimeLimitRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-time-limit-required",
      defaultMessage: "Time limit is required",
    },
    problemTimeLimitPositive: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-time-limit-positive",
      defaultMessage: "Time limit must be a positive number",
    },
    problemMemoryLimitRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-memory-limit-required",
      defaultMessage: "Memory limit is required",
    },
    problemMemoryLimitPositive: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-memory-limit-positive",
      defaultMessage: "Memory limit must be a positive number",
    },
    problemTestCasesRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-test-cases-required",
      defaultMessage: "Test cases are required",
    },
    problemTestCasesSize: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-test-cases-size",
      defaultMessage: "Test cases file must be at most 10MB",
    },
    problemTestCasesFormat: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.problem-test-cases-format",
      defaultMessage: "Test cases file must be in CSV format",
    },
    memberTypeRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-type-required",
      defaultMessage: "Type is required",
    },
    memberNameRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-name-required",
      defaultMessage: "Name is required",
    },
    memberNameTooLong: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-name-too-long",
      defaultMessage: "Name must be at most 64 characters long",
    },
    memberLoginRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-login-required",
      defaultMessage: "Login is required",
    },
    memberLoginTooLong: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-login-too-long",
      defaultMessage: "Login must be at most 32 characters long",
    },
    memberPasswordRequired: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-password-required",
      defaultMessage: "Password is required",
    },
    memberPasswordTooLong: {
      id: "app.[slug].(dashboard)._common.settings.settings-form.member-password-too-long",
      defaultMessage: "Password must be at most 32 characters long",
    },
  });

  static schema = (contestStatus: ContestStatus, originalAutoFreeze?: string) =>
    Joi.object({
      contest: Joi.object({
        slug: Joi.string()
          .min(1)
          .max(32)
          .pattern(/^[a-zA-Z0-9-]+$/)
          .required()
          .messages({
            "any.required": this.messages.slugRequired.id,
            "string.empty": this.messages.slugRequired.id,
            "string.min": this.messages.slugRequired.id,
            "string.max": this.messages.slugTooLong.id,
            "string.pattern.base": this.messages.slugPattern.id,
          }),
        title: Joi.string().min(1).max(255).required().messages({
          "any.required": this.messages.titleRequired.id,
          "string.empty": this.messages.titleRequired.id,
          "string.min": this.messages.titleRequired.id,
          "string.max": this.messages.titleTooLong.id,
        }),
        languages: Joi.object()
          .pattern(Joi.string(), Joi.boolean())
          .custom(
            (value: { [key in SubmissionLanguage]: boolean }, helpers) => {
              const hasSelectedLanguage = Object.values(value).some(
                (selected) => selected === true,
              );
              if (!hasSelectedLanguage) {
                return helpers.error("languages.required");
              }
              return value;
            },
          )
          .required()
          .messages({
            "any.required": this.messages.languagesRequired.id,
            "languages.required": this.messages.languagesRequired.id,
          }),
        startAt: Joi.string()
          .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
          .custom((value: string, helpers) => {
            try {
              // Skip future validation if contest is not in NOT_STARTED status
              if (contestStatus !== ContestStatus.NOT_STARTED) {
                return value;
              }

              const startDate = new Date(value);
              const currentTime = new Date();
              if (startDate <= currentTime) {
                return helpers.error("datetime-local.future");
              }
            } catch {
              return helpers.error("datetime-local.invalid");
            }

            return value;
          })
          .required()
          .messages({
            "any.required": this.messages.startRequired.id,
            "string.pattern.base": this.messages.startInvalid.id,
            "datetime-local.invalid": this.messages.startInvalid.id,
            "datetime-local.future": this.messages.startFuture.id,
          }),
        endAt: Joi.string()
          .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
          .custom((value: string, helpers) => {
            try {
              const endDate = new Date(value);
              const startValue = helpers.state.ancestors[0].startAt as string;

              if (startValue) {
                const startDate = new Date(startValue);
                if (endDate <= startDate) {
                  return helpers.error("datetime-local.after-start");
                }
              }

              return value;
            } catch {
              return helpers.error("datetime-local.invalid");
            }
          })
          .required()
          .messages({
            "any.required": this.messages.endRequired.id,
            "string.pattern.base": this.messages.endInvalid.id,
            "datetime-local.invalid": this.messages.endInvalid.id,
            "datetime-local.after-start": this.messages.endAfterStart.id,
          }),
        autoFreezeAt: Joi.string()
          .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
          .custom((value: string, helpers) => {
            try {
              if (value === originalAutoFreeze) {
                return value; // Skip validation if auto freeze date is unchanged
              }

              const autoFreezeDate = new Date(value);
              const startValue = helpers.state.ancestors[0].startAt as string;
              const endValue = helpers.state.ancestors[0].endAt as string;
              const now = new Date();

              if (startValue) {
                const startDate = new Date(startValue);
                if (autoFreezeDate <= startDate) {
                  return helpers.error(
                    "datetime-local.auto-freeze-after-start",
                  );
                }
              }

              if (endValue) {
                const endDate = new Date(endValue);
                if (autoFreezeDate >= endDate) {
                  return helpers.error("datetime-local.auto-freeze-before-end");
                }
              }

              if (autoFreezeDate <= now) {
                return helpers.error("datetime-local.future");
              }

              return value;
            } catch {
              return helpers.error("datetime-local.invalid");
            }
          })
          .messages({
            "string.pattern.base": this.messages.autoFreezeInvalid.id,
            "datetime-local.future": this.messages.autoFreezeFuture.id,
            "datetime-local.invalid": this.messages.autoFreezeInvalid.id,
            "datetime-local.auto-freeze-after-start":
              this.messages.autoFreezeAfterStart.id,
            "datetime-local.auto-freeze-before-end":
              this.messages.autoFreezeBeforeEnd.id,
          })
          .optional(),
        settings: Joi.object({
          isAutoJudgeEnabled: Joi.boolean().required(),
        }).required(),
      }).required(),
      problems: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string(),
            title: Joi.string().min(1).max(255).required().messages({
              "any.required": this.messages.problemTitleRequired.id,
              "string.empty": this.messages.problemTitleRequired.id,
              "string.min": this.messages.problemTitleRequired.id,
              "string.max": this.messages.problemTitleTooLong.id,
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
              "any.required": this.messages.problemDescriptionRequired.id,
              "file.required": this.messages.problemDescriptionRequired.id,
              "file.too-large": this.messages.problemDescriptionSize.id,
            }),
            timeLimit: Joi.number().greater(0).required().messages({
              "any.required": this.messages.problemTimeLimitRequired.id,
              "number.min": this.messages.problemTimeLimitPositive.id,
            }),
            memoryLimit: Joi.number().greater(0).required().messages({
              "any.required": this.messages.problemMemoryLimitRequired.id,
              "number.min": this.messages.problemMemoryLimitPositive.id,
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
              "any.required": this.messages.problemTestCasesRequired.id,
              "file.required": this.messages.problemTestCasesRequired.id,
              "file.too-large": this.messages.problemTestCasesSize.id,
              "file.invalid-type": this.messages.problemTestCasesFormat.id,
            }),
          }).unknown(),
        )
        .required(),
      members: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string(),
            type: Joi.string().required().messages({
              "any.required": this.messages.memberTypeRequired.id,
              "string.empty": this.messages.memberTypeRequired.id,
            }),
            name: Joi.string().min(1).max(64).required().messages({
              "any.required": this.messages.memberNameRequired.id,
              "string.empty": this.messages.memberNameRequired.id,
              "string.min": this.messages.memberNameRequired.id,
              "string.max": this.messages.memberNameTooLong.id,
            }),
            login: Joi.string().min(1).max(32).required().messages({
              "any.required": this.messages.memberLoginRequired.id,
              "string.empty": this.messages.memberLoginRequired.id,
              "string.min": this.messages.memberLoginRequired.id,
              "string.max": this.messages.memberLoginTooLong.id,
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
                "any.required": this.messages.memberPasswordRequired.id,
                "string.empty": this.messages.memberPasswordRequired.id,
                "string.min": this.messages.memberPasswordRequired.id,
                "string.max": this.messages.memberPasswordTooLong.id,
              }),
          }).unknown(),
        )
        .required(),
    }).unknown();

  static parseFiles(files: File[] | undefined) {
    return !!files && files.length > 0 ? files[0] : undefined;
  }

  static fromResponseDTO(contest: ContestFullResponseDTO): SettingsFormType {
    const problems = contest.problems
      .map((problem) => ({
        _id: problem.id,
        letter: problem.letter,
        title: problem.title,
        description: problem.description,
        newDescription: [],
        timeLimit: problem.timeLimit.toString(),
        memoryLimit: problem.memoryLimit.toString(),
        testCases: problem.testCases,
        newTestCases: [],
      }))
      .sort((a, b) => a.letter.localeCompare(b.letter));

    const members = contest.members.map((member) => ({
      _id: member.id,
      type: member.type,
      name: member.name,
      login: member.login,
      password: undefined,
    }));

    const languages = Object.values(SubmissionLanguage).reduce(
      (acc, lang) => {
        acc[lang] = contest.languages.includes(lang);
        return acc;
      },
      {} as Record<SubmissionLanguage, boolean>,
    );

    return {
      contest: {
        slug: contest.slug,
        title: contest.title,
        languages,
        startAt: DateTimeUtil.toDatetimeLocal(contest.startAt),
        endAt: DateTimeUtil.toDatetimeLocal(contest.endAt),
        settings: contest.settings,
        autoFreezeAt: contest.autoFreezeAt,
      },
      members,
      problems,
    };
  }

  static toInputDTO(form: SettingsFormType): UpdateContestInputDTO {
    return {
      slug: form.contest.slug,
      title: form.contest.title,
      languages: Object.keys(form.contest.languages).filter(
        (language) => form.contest.languages[language as SubmissionLanguage],
      ) as SubmissionLanguage[],
      startAt: DateTimeUtil.fromDatetimeLocal(form.contest.startAt),
      endAt: DateTimeUtil.fromDatetimeLocal(form.contest.endAt),
      autoFreezeAt: form.contest.autoFreezeAt,
      settings: form.contest.settings,
      members: form.members.map((member) => ({
        id: member._id,
        type: member.type,
        name: member.name,
        login: member.login,
        password:
          member.password && member.password.length > 0
            ? member.password
            : undefined,
      })),
      problems: form.problems.map((problem, idx) => ({
        id: problem._id,
        letter: String.fromCharCode(65 + idx),
        title: problem.title,
        description: problem.description,
        newDescription: this.parseFiles(problem.newDescription),
        timeLimit: parseInt(problem.timeLimit, 10),
        memoryLimit: parseInt(problem.memoryLimit, 10),
        testCases: problem.testCases,
        newTestCases: this.parseFiles(problem.newTestCases),
      })),
    };
  }
}
