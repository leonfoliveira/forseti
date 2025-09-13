import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { Attachment } from "@/core/domain/model/Attachment";

export interface AttachmentRepository {
  upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<Attachment>;

  download(contestId: string, attachment: Attachment): Promise<File>;
}
