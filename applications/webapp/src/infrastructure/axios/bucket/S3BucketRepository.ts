import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { BucketRepository } from "@/port/output/bucket/BucketRepository";

export class S3BucketRepository implements BucketRepository {
  async upload(signedUrl: string, file: File): Promise<void> {
    await fetch(signedUrl, {
      method: "PUT",
      body: file,
    });
  }

  async download(
    signedUrl: string,
    attachment: AttachmentResponseDTO,
  ): Promise<File> {
    const response = await fetch(signedUrl);
    const blob = await response.blob();
    return new File([blob], attachment.filename, {
      type: attachment.contentType,
    });
  }
}
