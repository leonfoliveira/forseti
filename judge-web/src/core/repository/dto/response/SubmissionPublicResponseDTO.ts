import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionPublicResponseDTO = {
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
  createdAt: string;
};
