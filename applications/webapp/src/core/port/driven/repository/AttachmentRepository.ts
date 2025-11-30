import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export interface AttachmentRepository {
  /**
   * Upload an attachment for a specific contest.
   *
   * @param contestId ID of the contest
   * @param context Context of the attachment
   * @param file The file to be uploaded
   * @returns The uploaded attachment data
   */
  upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO>;

  /**
   * Download an attachment for a specific contest.
   *
   * @param contestId ID of the contest
   * @param attachment The attachment to be downloaded
   * @returns The downloaded file
   */
  download(contestId: string, attachment: AttachmentResponseDTO): Promise<File>;
}
