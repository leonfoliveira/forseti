import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemMemberResponseDTO = {
  id: number;
  title: string;
  description: Attachment;
  isAccepted: boolean;
  wrongSubmissions: number;
};
