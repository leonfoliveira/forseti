import Joi from "joi";
import type { ParseKeys } from "i18next";

import { DateTimeUtil } from "@/app/_lib/util/DateTimeUtil";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { UpdateContestInputDTO } from "@/port/input/usecase/contest/ContestWriter";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";
import { ArrayUtil } from "@/util/ArrayUtil";

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
    frozenAt?: string;
    ipCIDRs: string;
    settings: {
      isAutoJudgeEnabled: boolean;
      isClarificationEnabled: boolean;
      isPrintRequestEnabled: boolean;
      isSpectatorEnabled: boolean;
    };
  };
  problems: {
    _id?: string;
    color: string;
    title: string;
    description?: AttachmentResponseDTO;
    newDescription?: File[];
    timeLimitMs: string;
    memoryLimitMb: string;
    testCases?: AttachmentResponseDTO;
    newTestCases?: File[];
  }[];
  members: {
    _id?: string;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
    ip?: string;
  }[];
};

export class SettingsForm {
  static schema = (contestStatus: ContestStatus) =>
    Joi.object({
      contest: Joi.object({
        slug: Joi.string()
          .min(1)
          .max(30)
          .pattern(/^[a-zA-Z0-9-]+$/)
          .required()
          .messages({
            "any.required":
              "[slug].(dashboard)._common.settings.SettingsForm.slugRequired",
            "string.empty":
              "[slug].(dashboard)._common.settings.SettingsForm.slugRequired",
            "string.min":
              "[slug].(dashboard)._common.settings.SettingsForm.slugRequired",
            "string.max":
              "[slug].(dashboard)._common.settings.SettingsForm.slugTooLong",
            "string.pattern.base":
              "[slug].(dashboard)._common.settings.SettingsForm.slugPatternInvalid",
          } as Record<string, ParseKeys>),
        title: Joi.string()
          .min(1)
          .max(200)
          .required()
          .messages({
            "any.required":
              "[slug].(dashboard)._common.settings.SettingsForm.titleRequired",
            "string.empty":
              "[slug].(dashboard)._common.settings.SettingsForm.titleRequired",
            "string.min":
              "[slug].(dashboard)._common.settings.SettingsForm.titleRequired",
            "string.max":
              "[slug].(dashboard)._common.settings.SettingsForm.titleTooLong",
          } as Record<string, ParseKeys>),
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
            "any.required":
              "[slug].(dashboard)._common.settings.SettingsForm.languagesRequired",
            "languages.required":
              "[slug].(dashboard)._common.settings.SettingsForm.languagesRequired",
          } as Record<string, ParseKeys>),
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
            "any.required":
              "[slug].(dashboard)._common.settings.SettingsForm.startAtRequired",
            "string.pattern.base":
              "[slug].(dashboard)._common.settings.SettingsForm.startAtInvalid",
            "datetime-local.invalid":
              "[slug].(dashboard)._common.settings.SettingsForm.startAtInvalid",
            "datetime-local.future":
              "[slug].(dashboard)._common.settings.SettingsForm.startAtFuture",
          } as Record<string, ParseKeys>),
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
            "any.required":
              "[slug].(dashboard)._common.settings.SettingsForm.endAtRequired",
            "string.pattern.base":
              "[slug].(dashboard)._common.settings.SettingsForm.endAtInvalid",
            "datetime-local.invalid":
              "[slug].(dashboard)._common.settings.SettingsForm.endAtInvalid",
            "datetime-local.after-start":
              "[slug].(dashboard)._common.settings.SettingsForm.endAtAfterStart",
          } as Record<string, ParseKeys>),
        autoFreezeAt: Joi.string()
          .allow("")
          .custom((value: string, helpers) => {
            try {
              if (value === "") {
                return value;
              }

              const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
              if (!pattern.test(value)) {
                return helpers.error("datetime-local.invalid");
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
          .optional()
          .messages({
            "string.pattern.base":
              "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtInvalid",
            "datetime-local.invalid":
              "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtInvalid",
            "datetime-local.auto-freeze-after-start":
              "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtBeforeStart",
            "datetime-local.auto-freeze-before-end":
              "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtAfterEnd",
            "datetime-local.future":
              "[slug].(dashboard)._common.settings.SettingsForm.autoFreezeAtFuture",
          } as Record<string, ParseKeys>),
        frozenAt: Joi.optional(),
        unfrozenAt: Joi.optional(),
        ipCIDRs: Joi.string()
          .allow("")
          .custom((value: string, helpers) => {
            const cidrs = ArrayUtil.fromString(value);
            const cidrRegex =
              /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-2][0-9]|3[0-2])$/;
            for (const cidr of cidrs) {
              if (!cidrRegex.test(cidr)) {
                return helpers.error("ipCIDRs.invalid");
              }
            }
            return value;
          })
          .messages({
            "ipCIDRs.invalid":
              "[slug].(dashboard)._common.settings.SettingsForm.ipCIDRsInvalid",
          } as Record<string, ParseKeys>),
        settings: Joi.object({
          isAutoJudgeEnabled: Joi.boolean().required(),
          isClarificationEnabled: Joi.boolean().required(),
          isPrintRequestEnabled: Joi.boolean().required(),
          isSpectatorEnabled: Joi.boolean().required(),
        }).required(),
      }).required(),
      problems: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string(),
            color: Joi.string()
              .pattern(/^#[A-Fa-f0-9]{6}$/)
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemColorRequired",
                "string.empty":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemColorRequired",
                "string.pattern.base":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemColorInvalid",
              } as Record<string, ParseKeys>),
            title: Joi.string()
              .min(1)
              .max(200)
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemTitleRequired",
                "string.empty":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemTitleRequired",
                "string.min":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemTitleRequired",
                "string.max":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemTitleTooLong",
              } as Record<string, ParseKeys>),
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
                if (value[0].type !== "application/pdf") {
                  return helpers.error("file.invalid-type");
                }
                return value;
              }).required(),
            }).messages({
              "any.required":
                "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionRequired",
              "file.required":
                "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionRequired",
              "file.too-large":
                "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionTooLarge",
              "file.invalid-type":
                "[slug].(dashboard)._common.settings.SettingsForm.problemDescriptionPDF",
            } as Record<string, ParseKeys>),
            timeLimitMs: Joi.number()
              .positive()
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemTimeLimitRequired",
                "number.positive":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemTimeLimitPositive",
              } as Record<string, ParseKeys>),
            memoryLimitMb: Joi.number()
              .positive()
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemMemoryLimitRequired",
                "number.positive":
                  "[slug].(dashboard)._common.settings.SettingsForm.problemMemoryLimitPositive",
              } as Record<string, ParseKeys>),
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
              "any.required":
                "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesRequired",
              "file.required":
                "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesRequired",
              "file.too-large":
                "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesTooLarge",
              "file.invalid-type":
                "[slug].(dashboard)._common.settings.SettingsForm.problemTestCasesCSV",
            } as Record<string, ParseKeys>),
          }).unknown(),
        )
        .required(),
      members: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string(),
            type: Joi.string()
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberTypeRequired",
                "string.empty":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberTypeRequired",
              } as Record<string, ParseKeys>),
            name: Joi.string()
              .min(1)
              .max(50)
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberNameRequired",
                "string.empty":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberNameRequired",
                "string.min":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberNameRequired",
                "string.max":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberNameTooLong",
              } as Record<string, ParseKeys>),
            login: Joi.string()
              .min(1)
              .max(30)
              .required()
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberLoginRequired",
                "string.empty":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberLoginRequired",
                "string.min":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberLoginRequired",
                "string.max":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberLoginTooLong",
              } as Record<string, ParseKeys>),
            password: Joi.string()
              .min(1)
              .max(30)
              .when("_id", {
                is: Joi.exist(),
                then: Joi.allow("").optional(),
                otherwise: Joi.required(),
              })
              .messages({
                "any.required":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordRequired",
                "string.empty":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordRequired",
                "string.min":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordRequired",
                "string.max":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberPasswordTooLong",
              } as Record<string, ParseKeys>),
            ip: Joi.string()
              .allow("")
              .ip()
              .messages({
                "string.ip":
                  "[slug].(dashboard)._common.settings.SettingsForm.memberIpInvalid",
              } as Record<string, ParseKeys>),
          }).unknown(),
        )
        .required(),
    }).unknown();

  static parseFiles(files: File[] | undefined) {
    return !!files && files.length > 0 ? files[0] : undefined;
  }

  static fromResponseDTO(
    contest: ContestWithMembersAndProblemsResponseDTO,
  ): SettingsFormType {
    const problems = [...contest.problems]
      .toSorted((a, b) => a.letter.localeCompare(b.letter))
      .map((problem) => ({
        _id: problem.id,
        color: problem.color,
        title: problem.title,
        description: problem.description,
        newDescription: [],
        timeLimitMs: problem.timeLimit.toString(),
        memoryLimitMb: problem.memoryLimit.toString(),
        testCases: problem.testCases,
        newTestCases: [],
      }));

    const members = contest.members.map((member) => ({
      _id: member.id,
      type: member.type,
      name: member.name,
      login: member.login,
      password: undefined,
      ip: member.ip ?? "",
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
        autoFreezeAt: contest.autoFreezeAt
          ? DateTimeUtil.toDatetimeLocal(contest.autoFreezeAt)
          : "",
        frozenAt: contest.frozenAt,
        ipCIDRs: ArrayUtil.toString(contest.ipCIDRs),
        settings: {
          isAutoJudgeEnabled: contest.settings.isAutoJudgeEnabled,
          isClarificationEnabled: contest.settings.isClarificationEnabled,
          isPrintRequestEnabled: contest.settings.isPrintRequestEnabled,
          isSpectatorEnabled: contest.settings.isSpectatorEnabled,
        },
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
      autoFreezeAt: form.contest.autoFreezeAt
        ? DateTimeUtil.fromDatetimeLocal(form.contest.autoFreezeAt)
        : undefined,
      frozenAt: form.contest.frozenAt,
      ipCIDRs: ArrayUtil.fromString(form.contest.ipCIDRs),
      settings: {
        isAutoJudgeEnabled: form.contest.settings.isAutoJudgeEnabled,
        isClarificationEnabled: form.contest.settings.isClarificationEnabled,
        isPrintRequestEnabled: form.contest.settings.isPrintRequestEnabled,
        isSpectatorEnabled: form.contest.settings.isSpectatorEnabled,
      },
      members: form.members.map((member) => ({
        id: member._id,
        type: member.type,
        name: member.name,
        login: member.login,
        password:
          member.password && member.password.length > 0
            ? member.password
            : undefined,
        ip: member.ip !== "" ? member.ip : undefined,
      })),
      problems: form.problems.map((problem, idx) => ({
        id: problem._id,
        letter: String.fromCharCode(65 + idx),
        color: problem.color,
        title: problem.title,
        description: problem.description,
        newDescription: this.parseFiles(problem.newDescription),
        timeLimitMs: parseInt(problem.timeLimitMs, 10),
        memoryLimitMb: parseInt(problem.memoryLimitMb, 10),
        testCases: problem.testCases,
        newTestCases: this.parseFiles(problem.newTestCases),
      })),
    };
  }
}
