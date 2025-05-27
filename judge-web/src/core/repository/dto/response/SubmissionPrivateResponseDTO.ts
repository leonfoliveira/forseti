import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { Attachment } from "@/core/domain/model/Attachment";

export type SubmissionPrivateResponseDTO = {
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
  code: Attachment;
  createdAt: string;
  updatedAt: string;
};
