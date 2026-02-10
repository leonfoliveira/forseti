import Joi from "joi";

import { CreateAnnouncementRequestDTO } from "@/core/port/dto/request/CreateAnnouncementRequestDTO";
import { defineMessages } from "@/i18n/message";

export type AnnouncementFormType = {
  text: string;
};

export class AnnouncementForm {
  static messages = defineMessages({
    textRequired: {
      id: "app.[slug].(dashboard)._common._form.announcement-form-schema.text-required",
      defaultMessage: "Required",
    },
    textLong: {
      id: "app.[slug].(dashboard)._common._form.announcement-form-schema.text-long",
      defaultMessage: "Cannot exceed 255 characters",
    },
  });

  static schema = Joi.object({
    text: Joi.string().required().max(255).messages({
      "any.required": this.messages.textRequired.id,
      "string.empty": this.messages.textRequired.id,
      "string.max": this.messages.textLong.id,
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
