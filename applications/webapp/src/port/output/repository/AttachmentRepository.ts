import { GetUploadSignedUrlRequest } from "@/port/dto/request/GetUploadSignedUrlRequest";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { SignedUploadAttachmentResponseDTO } from "@/port/dto/response/attachment/SignedUploadAttachmentResponseDTO";
import { SignedDownloadAttachmentResponseDTO } from "@/port/dto/response/attachment/SignedDownloadAttachmentResponseDTO";

export interface AttachmentRepository {
  /**
   * Get a signed URL for uploading an attachment.
   *
   * @param contestId ID of the contest
   * @param requestDTO The request DTO containing fileName, context, and contentType
   * @returns The signed URL and attachment data for uploading the attachment
   */
  getUploadSignedUrl(
    contestId: string,
    requestDTO: GetUploadSignedUrlRequest,
  ): Promise<SignedUploadAttachmentResponseDTO>;

  /**
   * Get a signed URL for downloading an attachment.
   *
   * @param contestId ID of the contest
   * @param attachment The attachment to be downloaded
   * @returns The signed URL and attachment data for downloading the attachment
   */
  getDownloadSignedUrl(
    contestId: string,
    attachment: AttachmentResponseDTO,
  ): Promise<SignedDownloadAttachmentResponseDTO>;
}
