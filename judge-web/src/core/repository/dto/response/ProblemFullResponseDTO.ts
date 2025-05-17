import { AttachmentResponseDTO } from "@/core/repository/dto/response/AttachmentResponseDTO";

export type ProblemFullResponseDTO = {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  testCases: AttachmentResponseDTO;
};
