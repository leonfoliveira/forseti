import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { Attachment } from "@/core/domain/model/Attachment";

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async upload(file: File): Promise<Attachment> {
    return this.attachmentRepository.upload(file);
  }

  async download(attachment: Attachment) {
    const file = await this.attachmentRepository.download(attachment);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
