import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export interface AttachmentRepository {
  upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO>;

  download(contestId: string, attachment: AttachmentResponseDTO): Promise<File>;
}
