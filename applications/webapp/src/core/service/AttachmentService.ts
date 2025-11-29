import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentRepository } from "@/core/port/driven/repository/AttachmentRepository";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export class AttachmentService {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO> {
    return this.attachmentRepository.upload(contestId, context, file);
  }

  async download(contestId: string, attachment: AttachmentResponseDTO) {
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
