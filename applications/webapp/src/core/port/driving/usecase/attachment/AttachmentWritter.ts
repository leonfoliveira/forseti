import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export interface AttachmentWritter {
  /**
   * Upload a file as an attachment.
   *
   * @param contestId ID of the contest
   * @param context Context of the attachment
   * @param file The file to upload
   * @return The created attachment
   */
  upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO>;
}
