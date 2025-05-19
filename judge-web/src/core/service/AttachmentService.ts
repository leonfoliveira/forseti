import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { AttachmentRequestDTO } from "@/core/repository/dto/request/AttachmentRequestDTO";

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async uploadAttachment(file: File): Promise<AttachmentRequestDTO> {
    const uploadAttachment =
      await this.attachmentRepository.createUploadAttachment();
    await this.attachmentRepository.uploadAttachment(
      uploadAttachment.url,
      file,
    );
    return {
      filename: file.name,
      key: uploadAttachment.key,
    };
  }

  async downloadAttachment(url: string): Promise<File> {
    return this.attachmentRepository.downloadAttachment(url);
  }
}
