import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

export type SubmissionEmmitDTO = {
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
