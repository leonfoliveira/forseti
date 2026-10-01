import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export type SubmissionWithCodeResponseDTO = SubmissionResponseDTO & {
  code: AttachmentResponseDTO;
};
