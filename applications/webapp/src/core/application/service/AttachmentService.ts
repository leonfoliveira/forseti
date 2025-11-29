import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentRepository } from "@/core/port/driven/repository/AttachmentRepository";
import { AttachmentReader } from "@/core/port/driving/usecase/attachment/AttachmentReader";
import { AttachmentWritter } from "@/core/port/driving/usecase/attachment/AttachmentWritter";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export class AttachmentService implements AttachmentReader, AttachmentWritter {
  constructor(private attachmentRepository: AttachmentRepository) {}

  /**
   * Upload a file as an attachment.
   *
   * @param contestId ID of the contest
   * @param context Context of the attachment
   * @param file The file to upload
   * @return The created attachment
   */
  async upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO> {
    return this.attachmentRepository.upload(contestId, context, file);
  }

  /**
   * Download a file associated with an attachment.
   *
   * @param contestId ID of the contest
   * @param attachment The attachment to download
   * @return The downloaded file
   */
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
}
