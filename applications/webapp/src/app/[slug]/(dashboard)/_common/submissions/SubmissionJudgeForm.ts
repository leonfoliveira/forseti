import Joi from "joi";

import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";

export type SubmissionJudgeFormType = {
  answer: SubmissionAnswer;
};

export class SubmissionJudgeForm {
  static schema = Joi.object({
    answer: Joi.string().required().messages({
      "any.required": "Answer is Required",
      "string.empty": "Answer is Required",
    }),
  });

  static getDefault(): SubmissionJudgeFormType {
    return {
      answer: "",
    } as unknown as SubmissionJudgeFormType;
  }
}
