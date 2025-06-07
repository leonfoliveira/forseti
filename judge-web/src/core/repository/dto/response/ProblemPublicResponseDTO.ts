import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemPublicResponseDTO = {
  id: string;
  title: string;
  description: Attachment;
};
