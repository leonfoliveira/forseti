import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemWithStatusResponseDTO = {
  id: string;
  title: string;
  description: Attachment;
  isAccepted: boolean;
  wrongSubmissions: number;
};
