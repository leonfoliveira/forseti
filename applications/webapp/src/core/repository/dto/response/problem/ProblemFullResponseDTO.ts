import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemFullResponseDTO = {
  id: string;
  letter: string;
  title: string;
  description: Attachment;
  timeLimit: number;
  memoryLimit: number;
  testCases: Attachment;
};
