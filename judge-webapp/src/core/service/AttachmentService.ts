import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { Attachment } from "@/core/domain/model/Attachment";
import { AttachmentRepository } from "@/core/repository/AttachmentRepository";

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<Attachment> {
    return this.attachmentRepository.upload(contestId, context, file);
  }

  async download(contestId: string, attachment: Attachment) {
    const file = await this.attachmentRepository.download(
      contestId,
      attachment,
    );
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
