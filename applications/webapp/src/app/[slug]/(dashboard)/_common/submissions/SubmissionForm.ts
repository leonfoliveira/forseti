import Joi from "joi";
import type { ParseKeys } from "i18next";

import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { CreateSubmissionInputDTO } from "@/port/input/usecase/submission/SubmissionWriter";

export type SubmissionFormType = {
  problemId: string;
  language: SubmissionLanguage;
  code: File[];
};

export class SubmissionForm {
  static schema = Joi.object({
    problemId: Joi.string()
      .required()
      .messages({
        "any.required":
          "[slug].(dashboard)._common.submissions.SubmissionForm.problemRequired",
        "string.empty":
          "[slug].(dashboard)._common.submissions.SubmissionForm.problemRequired",
      } as Record<string, ParseKeys>),
    language: Joi.string()
      .required()
      .messages({
        "any.required":
          "[slug].(dashboard)._common.submissions.SubmissionForm.languageRequired",
        "string.empty":
          "[slug].(dashboard)._common.submissions.SubmissionForm.languageRequired",
      } as Record<string, ParseKeys>),
    code: Joi.custom((value: File[], helpers) => {
      if (value.length === 0) {
        return helpers.error("file.required");
      }
      if (value[0].size > 10 * 1024 * 1024) {
        return helpers.error("file.too-large");
      }
      return value;
    })
      .required()
      .messages({
        "any.required":
          "[slug].(dashboard)._common.submissions.SubmissionForm.codeRequired",
        "file.required":
          "[slug].(dashboard)._common.submissions.SubmissionForm.codeRequired",
        "file.too-large":
          "[slug].(dashboard)._common.submissions.SubmissionForm.codeTooLarge",
      } as Record<string, ParseKeys>),
  });

  static toInputDTO(data: SubmissionFormType): CreateSubmissionInputDTO {
    return {
      problemId: data.problemId,
      language: data.language,
      code: data.code[0],
    };
  }

  static getDefault(): SubmissionFormType {
    return {
      problemId: "",
      language: "",
      code: "",
    } as unknown as SubmissionFormType;
  }
}
