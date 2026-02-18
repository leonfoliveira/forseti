import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { MemberPublicResponseDTO } from "@/core/port/dto/response/member/MemberPublicResponseDTO";

export type TicketResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  member: MemberPublicResponseDTO;
  staff?: MemberPublicResponseDTO;
  status: TicketStatus;
} & (
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
    }
);
