import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionResponseDTO = {
  id: number;
  problemId: number;
  memberId: number;
  status: SubmissionStatus;
  language: Language;
  createdAt: string;
};
