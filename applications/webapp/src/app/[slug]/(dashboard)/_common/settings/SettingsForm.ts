import Joi from "joi";

import { DateTimeUtil } from "@/app/_lib/util/DateTimeUtil";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { UpdateContestInputDTO } from "@/port/input/usecase/contest/ContestWritter";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export type SettingsFormType = {
  contest: {
    slug: string;
    title: string;
    languages: {
      [key in SubmissionLanguage]: boolean;
    };
    startAt: string;
    endAt: string;
  };
  problems: {
    _id?: string;
    color: string;
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
  static schema = (contestStatus: ContestStatus) =>
    Joi.object({
      contest: Joi.object({
        slug: Joi.string()
          .min(1)
          .max(30)
          .pattern(/^[a-zA-Z0-9-]+$/)
          .required()
          .messages({
            "any.required": "Slug is required",
            "string.empty": "Slug is required",
            "string.min": "Slug is required",
            "string.max": "Slug must be at most 30 characters long",
            "string.pattern.base":
              "Slug must only contain alphanumeric characters and hyphens",
          }),
        title: Joi.string().min(1).max(200).required().messages({
          "any.required": "Title is required",
          "string.empty": "Title is required",
          "string.min": "Title is required",
          "string.max": "Title must be at most 200 characters long",
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
            "any.required": "At least one language is required",
            "languages.required": "At least one language is required",
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
            "any.required": "Start date is required",
            "string.pattern.base": "Start date is invalid",
            "datetime-local.invalid": "Start date is invalid",
            "datetime-local.future": "Start date must be in the future",
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
            "any.required": "End date is required",
            "string.pattern.base": "End date is invalid",
            "datetime-local.invalid": "End date is invalid",
            "datetime-local.after-start":
              "End date must be after the start date",
          }),
      }).required(),
      problems: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string(),
            color: Joi.string()
              .pattern(/^#[A-Fa-f0-9]{6}$/)
              .required()
              .messages({
                "any.required": "Problem color is required",
                "string.empty": "Problem color is required",
                "string.pattern.base": "Problem color is invalid",
              }),
            title: Joi.string().min(1).max(200).required().messages({
              "any.required": "Problem title is required",
              "string.empty": "Problem title is required",
              "string.min": "Problem title is required",
              "string.max": "Problem title is too long",
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
                if (value[0].type !== "application/pdf") {
                  return helpers.error("file.invalid-type");
                }
                return value;
              }).required(),
            }).messages({
              "any.required": "Problem description is required",
              "file.required": "Problem description is required",
              "file.too-large": "Problem description must be smaller than 10MB",
              "file.invalid-type": "Problem description must be a PDF",
            }),
            timeLimit: Joi.number().greater(0).required().messages({
              "any.required": "Problem time limit is required",
              "number.min": "Problem time limit must be positive",
            }),
            memoryLimit: Joi.number().greater(0).required().messages({
              "any.required": "Problem memory limit is required",
              "number.min": "Problem memory limit must be positive",
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
              "any.required": "Problem test cases are required",
              "file.required": "Problem test cases are required",
              "file.too-large": "Problem test cases must be smaller than 10MB",
              "file.invalid-type": "Problem test cases must be a CSV",
            }),
          }).unknown(),
        )
        .required(),
      members: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string(),
            type: Joi.string().required().messages({
              "any.required": "Member type is required",
              "string.empty": "Member type is required",
            }),
            name: Joi.string().min(1).max(50).required().messages({
              "any.required": "Member name is required",
              "string.empty": "Member name is required",
              "string.min": "Member name is required",
              "string.max": "Member name is too long",
            }),
            login: Joi.string().min(1).max(30).required().messages({
              "any.required": "Member login is required",
              "string.empty": "Member login is required",
              "string.min": "Member login is required",
              "string.max": "Member login is too long",
            }),
            password: Joi.string()
              .min(1)
              .max(30)
              .when("_id", {
                is: Joi.exist(),
                then: Joi.allow("").optional(),
                otherwise: Joi.required(),
              })
              .messages({
                "any.required": "Member password is required",
                "string.empty": "Member password is required",
                "string.min": "Member password is required",
                "string.max": "Member password is too long",
              }),
          }).unknown(),
        )
        .required(),
    }).unknown();

  static parseFiles(files: File[] | undefined) {
    return !!files && files.length > 0 ? files[0] : undefined;
  }

  static fromResponseDTO(
    contest: ContestWithMembersAndProblemsDTO,
  ): SettingsFormType {
    const problems = [...contest.problems]
      .sort((a, b) => a.letter.localeCompare(b.letter))
      .map((problem) => ({
        _id: problem.id,
        color: problem.color,
        title: problem.title,
        description: problem.description,
        newDescription: [],
        timeLimit: problem.timeLimit.toString(),
        memoryLimit: problem.memoryLimit.toString(),
        testCases: problem.testCases,
        newTestCases: [],
      }));

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
        color: problem.color,
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
