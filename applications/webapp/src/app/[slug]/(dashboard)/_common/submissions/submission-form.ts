import Joi from "joi";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { CreateSubmissionInputDTO } from "@/core/port/driving/usecase/submission/SubmissionWritter";
import { defineMessages } from "@/i18n/message";

export type SubmissionFormType = {
  problemId: string;
  language: SubmissionLanguage;
  code: File[];
};

export class SubmissionForm {
  static messages = defineMessages({
    problemRequired: {
      id: "app.[slug].(dashboard)._common.submissions.submission-form.problem-required",
      defaultMessage: "Required",
    },
    languageRequired: {
      id: "app.[slug].(dashboard)._common.submissions.submission-form.language-required",
      defaultMessage: "Required",
    },
    codeRequired: {
      id: "app.[slug].(dashboard)._common.submissions.submission-form.code-required",
      defaultMessage: "Required",
    },
    codeTooLarge: {
      id: "app.[slug].(dashboard)._common.submissions.submission-form.code-too-large",
      defaultMessage: "Code file must be at most 10MB",
    },
  });

  static schema = Joi.object({
    problemId: Joi.string().required().messages({
      "any.required": this.messages.problemRequired.id,
      "string.empty": this.messages.problemRequired.id,
    }),
    language: Joi.string().required().messages({
      "any.required": this.messages.languageRequired.id,
      "string.empty": this.messages.languageRequired.id,
    }),
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
        "any.required": this.messages.codeRequired.id,
        "file.required": this.messages.codeRequired.id,
        "file.too-large": this.messages.codeTooLarge.id,
      }),
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
