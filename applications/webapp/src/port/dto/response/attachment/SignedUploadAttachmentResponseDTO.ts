import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";

export type SignedUploadAttachmentResponseDTO = {
  attachment: AttachmentResponseDTO;
  uploadUrl: string;
};
