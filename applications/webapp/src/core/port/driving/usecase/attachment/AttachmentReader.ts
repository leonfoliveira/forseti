import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export interface AttachmentReader {
  /**
   * Download a file associated with an attachment.
   *
   * @param contestId ID of the contest
   * @param attachment The attachment to download
   * @return The downloaded file
   */
  download(contestId: string, attachment: AttachmentResponseDTO): Promise<File>;
}
