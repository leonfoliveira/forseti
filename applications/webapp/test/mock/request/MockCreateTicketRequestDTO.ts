import { TicketType } from "@/core/domain/enumerate/TicketType";
import { CreateTicketRequestDTO } from "@/core/port/dto/request/CreateTicketRequestDTO";

export function MockCreateTicketRequestDTO(
  partial: Partial<CreateTicketRequestDTO> = {},
): CreateTicketRequestDTO {
  return {
    type: TicketType.TECHNICAL_SUPPORT,
    properties: {
      description: "My submission is not being judged",
    },
    ...partial,
  } as CreateTicketRequestDTO;
}
