import { Attachment } from "@/core/domain/model/Attachment";

export type ProblemPublicResponseDTO = {
  id: string;
  letter: string;
  title: string;
  description: Attachment;
};
