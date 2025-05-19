import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { UploadAttachmentResponseDTO } from "@/core/repository/dto/response/UploadAttachmentResponseDTO";

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async createUploadAttachment(): Promise<UploadAttachmentResponseDTO> {
    return this.attachmentRepository.createUploadAttachment();
  }

  async uploadAttachment(url: string, file: File): Promise<void> {
    return this.attachmentRepository.uploadAttachment(url, file);
  }

  async downloadAttachment(url: string): Promise<File> {
    return this.attachmentRepository.downloadAttachment(url);
  }
}
