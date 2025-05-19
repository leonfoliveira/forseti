import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { UploadAttachmentResponseDTO } from "@/core/repository/dto/response/UploadAttachmentResponseDTO";

export class AxiosAttachmentRepository implements AttachmentRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  createUploadAttachment(): Promise<UploadAttachmentResponseDTO> {
    return this.axiosClient.post<UploadAttachmentResponseDTO>(
      "/v1/attachments/upload",
    );
  }

  uploadAttachment(url: string, file: File): Promise<void> {
    return this.axiosClient.put<void>(url, {
      url,
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  downloadAttachment(url: string): Promise<File> {
    return this.axiosClient.get<File>(url, {
      responseType: "blob",
    });
  }
}
