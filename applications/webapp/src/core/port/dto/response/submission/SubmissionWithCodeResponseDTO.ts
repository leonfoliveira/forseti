import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";

export type SubmissionWithCodeResponseDTO = SubmissionResponseDTO & {
  code: AttachmentResponseDTO;
};
