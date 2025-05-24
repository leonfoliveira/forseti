import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

export type SubmissionResponseDTO = {
  id: number;
  problem: {
    id: number;
    title: string;
  };
  member: {
    id: number;
    name: string;
  };
  language: Language;
  status: SubmissionStatus;
  code: DownloadAttachmentResponseDTO;
  createdAt: string;
  updatedAt: string;
};
