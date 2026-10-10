import Joi from "joi";

import { CreateAnnouncementRequestDTO } from "@/port/dto/request/CreateAnnouncementRequestDTO";

export type AnnouncementFormType = {
  text: string;
};

export class AnnouncementForm {
  static schema = Joi.object({
    text: Joi.string().required().max(500).messages({
      "any.required": "Text is Required",
      "string.empty": "Text is Required",
      "string.max": "Cannot exceed 500 characters",
    }),
  });

  static toInputDTO(data: AnnouncementFormType): CreateAnnouncementRequestDTO {
    return {
      text: data.text,
    };
  }

  static getDefault(): AnnouncementFormType {
    return {
      text: "",
    };
  }
}
