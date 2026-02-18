import { Member } from "@/test/entity/member";

export type Ticket = {
  member: Member;
  type: TicketType;
  status: TicketStatus;
  description: string;
};

export enum TicketType {
  SUBMISSION_PRINT = "Submission Print",
  TECHNICAL_SUPPORT = "Technical Support",
  NON_TECHNICAL_SUPPORT = "Non-Technical Support",
}

export enum TicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
}
