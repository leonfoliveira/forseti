import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type ProblemResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  letter: string;
  color: string;
  title: string;
  description: AttachmentResponseDTO;
  timeLimit: number;
  memoryLimit: number;
  version: number;
};
