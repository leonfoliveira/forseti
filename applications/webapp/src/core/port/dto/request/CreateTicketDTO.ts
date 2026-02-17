import { TicketType } from "@/core/domain/enumerate/TicketType";

export type CreateTicketDTO =
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
