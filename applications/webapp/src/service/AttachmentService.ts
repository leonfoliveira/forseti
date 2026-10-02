import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";
import { AttachmentRepository } from "@/port/output/repository/AttachmentRepository";
import { AttachmentReader } from "@/port/input/usecase/attachment/AttachmentReader";
import { AttachmentWritter } from "@/port/input/usecase/attachment/AttachmentWritter";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { BucketRepository } from "@/port/output/bucket/BucketRepository";

export class AttachmentService implements AttachmentReader, AttachmentWritter {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private bucketRepository: BucketRepository,
  ) {}

  async upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO> {
    const { attachment, uploadUrl } =
      await this.attachmentRepository.getUploadSignedUrl(contestId, {
        filename: file.name,
        context,
        contentType: file.type,
      });
    await this.bucketRepository.upload(uploadUrl, file);
    return attachment;
  }

  async download(
    contestId: string,
    attachment: AttachmentResponseDTO,
  ): Promise<File> {
    const { downloadUrl } =
      await this.attachmentRepository.getDownloadSignedUrl(
        contestId,
        attachment,
      );
    const file = await this.bucketRepository.download(downloadUrl, attachment);

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
    const { downloadUrl } =
      await this.attachmentRepository.getDownloadSignedUrl(
        contestId,
        attachment,
      );
    const file = await this.bucketRepository.download(downloadUrl, attachment);

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
