import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type ProblemPublicResponseDTO = {
  id: string;
  letter: string;
  title: string;
  description: AttachmentResponseDTO;
  timeLimit: number;
  memoryLimit: number;
};
