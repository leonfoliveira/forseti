import { UploadAttachmentResponseDTO } from "@/core/repository/dto/response/UploadAttachmentResponseDTO";

export interface AttachmentRepository {
  createUploadAttachment(): Promise<UploadAttachmentResponseDTO>;

  uploadAttachment(url: string, file: File): Promise<void>;
}
