import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemPrivateResponseDTO = {
  id: number;
  title: string;
  description: Attachment;
  timeLimit: number;
  testCases: Attachment;
};
