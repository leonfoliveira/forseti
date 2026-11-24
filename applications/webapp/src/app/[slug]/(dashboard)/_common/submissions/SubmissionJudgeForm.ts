import type { ParseKeys } from "i18next";
import Joi from "joi";

import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";

export type SubmissionJudgeFormType = {
  answer: SubmissionAnswer;
};

export class SubmissionJudgeForm {
  static schema = Joi.object({
    answer: Joi.string()
      .required()
      .messages({
        "any.required":
          "[slug].(dashboard)._common.submissions.SubmissionJudgeForm.answerRequired",
        "string.empty":
          "[slug].(dashboard)._common.submissions.SubmissionJudgeForm.answerRequired",
      } as Record<string, ParseKeys>),
  });

  static getDefault(): SubmissionJudgeFormType {
    return {
      answer: "",
    } as unknown as SubmissionJudgeFormType;
  }
}
