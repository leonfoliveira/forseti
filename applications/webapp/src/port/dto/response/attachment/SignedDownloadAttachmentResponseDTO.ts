import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";

export type SignedDownloadAttachmentResponseDTO = {
  attachment: AttachmentResponseDTO;
  downloadUrl: string;
};
