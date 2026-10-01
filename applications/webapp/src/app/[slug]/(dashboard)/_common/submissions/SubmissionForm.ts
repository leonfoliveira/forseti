import Joi from "joi";

import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { CreateSubmissionInputDTO } from "@/port/input/usecase/submission/SubmissionWritter";

export type SubmissionFormType = {
  problemId: string;
  language: SubmissionLanguage;
  code: File[];
};

export class SubmissionForm {
  static schema = Joi.object({
    problemId: Joi.string().required().messages({
      "any.required": "Problem is Required",
      "string.empty": "Problem is Required",
    }),
    language: Joi.string().required().messages({
      "any.required": "Language is Required",
      "string.empty": "Language is Required",
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
        "any.required": "Code is Required",
        "file.required": "Code is Required",
        "file.too-large": "Code file must be at most 10MB",
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
