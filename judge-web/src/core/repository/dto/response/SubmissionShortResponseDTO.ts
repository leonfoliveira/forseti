import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionResponseDTO = {
  id: number;
  problemId: number;
  memberId: number;
  language: Language;
  status: SubmissionStatus;
  createdAt: string;
};
