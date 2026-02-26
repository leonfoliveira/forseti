import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentRepository } from "@/core/port/driven/repository/AttachmentRepository";
import { AttachmentReader } from "@/core/port/driving/usecase/attachment/AttachmentReader";
import { AttachmentWritter } from "@/core/port/driving/usecase/attachment/AttachmentWritter";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export class AttachmentService implements AttachmentReader, AttachmentWritter {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO> {
    return this.attachmentRepository.upload(contestId, context, file);
  }

  async download(
    contestId: string,
    attachment: AttachmentResponseDTO,
  ): Promise<File> {
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

    return file;
  }

  async print(
    contestId: string,
    attachment: AttachmentResponseDTO,
  ): Promise<void> {
    const file = await this.attachmentRepository.download(
      contestId,
      attachment,
    );

    const url = URL.createObjectURL(file);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    };
  }
}
