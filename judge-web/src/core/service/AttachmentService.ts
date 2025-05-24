import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { AttachmentRequestDTO } from "@/core/repository/dto/request/AttachmentRequestDTO";
import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async uploadAttachment(file: File): Promise<AttachmentRequestDTO> {
    const uploadAttachment =
      await this.attachmentRepository.createUploadAttachment();
    uploadAttachment.url = uploadAttachment.url.replace(
      "judge.localhost:4566",
      "localhost:4566/judge",
    );
    await this.attachmentRepository.uploadAttachment(
      uploadAttachment.url,
      file,
    );
    return {
      filename: file.name,
      key: uploadAttachment.key,
    };
  }

  downloadAttachment(attachment: DownloadAttachmentResponseDTO) {
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = attachment.url.replace(
      "judge.localhost:4566",
      "localhost:4566/judge",
    );
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
