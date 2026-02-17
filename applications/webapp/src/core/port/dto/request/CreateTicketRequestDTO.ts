import { TicketType } from "@/core/domain/enumerate/TicketType";

export type CreateTicketRequestDTO =
  | {
      type: TicketType.SUBMISSION_PRINT;
      properties: {
        submissionId: string;
        attachmentId: string;
      };
    }
  | {
      type: TicketType.TECHNICAL_SUPPORT;
      properties: {
        description: string;
      };
    }
  | {
      type: TicketType.NON_TECHNICAL_SUPPORT;
      properties: {
        description: string;
      };
    };
