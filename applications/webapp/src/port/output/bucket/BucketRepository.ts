import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";

export interface BucketRepository {
  /**
   * Upload a file to the specified signed URL.
   *
   * @param signedUrl The signed URL to which the file will be uploaded
   * @param file The file to be uploaded
   */
  upload(signedUrl: string, file: File): Promise<void>;

  /**
   * Download a file from the specified signed URL.
   *
   * @param signedUrl The signed URL from which the file will be downloaded
   * @param attachment The attachment metadata for the file to be downloaded
   * @returns The downloaded file
   */
  download(signedUrl: string, attachment: AttachmentResponseDTO): Promise<File>;
}
