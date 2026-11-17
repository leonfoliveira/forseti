import type { ParseKeys } from "i18next";
import Joi from "joi";

import { CreateAnnouncementRequestDTO } from "@/port/dto/request/announcement/CreateAnnouncementRequestDTO";

export type AnnouncementFormType = {
  text: string;
};

export class AnnouncementForm {
  static schema = Joi.object({
    text: Joi.string()
      .required()
      .max(500)
      .messages({
        "any.required":
          "[slug].(dashboard)._common.announcements.AnnouncementForm.textRequired",
        "string.empty":
          "[slug].(dashboard)._common.announcements.AnnouncementForm.textRequired",
        "string.max":
          "[slug].(dashboard)._common.announcements.AnnouncementForm.textTooLong",
      } as Record<string, ParseKeys>),
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
