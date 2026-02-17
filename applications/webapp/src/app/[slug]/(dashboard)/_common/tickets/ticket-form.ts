import Joi from "joi";

import { TicketType } from "@/core/domain/enumerate/TicketType";
import { CreateTicketRequestDTO } from "@/core/port/dto/request/CreateTicketRequestDTO";
import { defineMessages } from "@/i18n/message";

export type TicketFormType = {
  type: TicketType;
  description: string;
};

export class TicketForm {
  static messages = defineMessages({
    typeRequired: {
      id: "app.[slug].(dashboard)._common.tickets.ticket-form.type-required",
      defaultMessage: "Type is required",
    },
    typeInvalid: {
      id: "app.[slug].(dashboard)._common.tickets.ticket-form.type-invalid",
      defaultMessage: "Invalid ticket type",
    },
    descriptionRequired: {
      id: "app.[slug].(dashboard)._common.tickets.ticket-form.description-required",
      defaultMessage: "Description is required",
    },
    descriptionTooLong: {
      id: "app.[slug].(dashboard)._common.tickets.ticket-form.description-too-long",
      defaultMessage: "Description must have less than 512 characters",
    },
  });

  static schema = Joi.object({
    type: Joi.string()
      .valid(TicketType.NON_TECHNICAL_SUPPORT, TicketType.TECHNICAL_SUPPORT)
      .required()
      .messages({
        "any.required": this.messages.typeRequired.id,
        "string.empty": this.messages.typeRequired.id,
        "any.only": this.messages.typeInvalid.id,
      }),
    description: Joi.string().max(511).required().messages({
      "any.required": this.messages.descriptionRequired.id,
      "string.empty": this.messages.descriptionRequired.id,
      "string.max": this.messages.descriptionTooLong.id,
    }),
  });

  static toRequestDTO(data: TicketFormType): CreateTicketRequestDTO {
    return {
      type: data.type as
        | TicketType.NON_TECHNICAL_SUPPORT
        | TicketType.TECHNICAL_SUPPORT,
      properties: {
        description: data.description,
      },
    };
  }

  static getDefault(): TicketFormType {
    return {
      type: "" as TicketType,
      description: "",
    };
  }
}
