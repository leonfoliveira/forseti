import { Attachment } from "@/core/domain/model/Attachment";

export interface AttachmentRepository {
  upload(file: File): Promise<Attachment>;

  download(attachment: Attachment): Promise<File>;
}
