import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemFullResponseDTO = {
  id: string;
  title: string;
  description: Attachment;
  timeLimit: number;
  testCases: Attachment;
};
