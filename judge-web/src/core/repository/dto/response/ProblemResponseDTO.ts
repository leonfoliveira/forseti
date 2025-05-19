import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

export type ProblemResponseDTO = {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  testCases: DownloadAttachmentResponseDTO;
};
