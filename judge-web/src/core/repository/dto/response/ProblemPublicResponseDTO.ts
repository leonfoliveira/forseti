import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemPublicResponseDTO = {
  id: number;
  title: string;
  description: Attachment;
};
