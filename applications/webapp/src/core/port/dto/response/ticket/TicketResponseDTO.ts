import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";

export type TicketResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  member: MemberResponseDTO;
  staff?: MemberResponseDTO;
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
