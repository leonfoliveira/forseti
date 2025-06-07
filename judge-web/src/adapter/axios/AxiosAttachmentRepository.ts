import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AttachmentRepository } from "@/core/repository/AttachmentRepository";
import { Attachment } from "@/core/domain/model/Attachment";

export class AxiosAttachmentRepository implements AttachmentRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async upload(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.axiosClient.post<Attachment>(
      "/v1/attachments",
      {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  async download(attachment: Attachment): Promise<File> {
    const response = await this.axiosClient.get<Blob>(
      `/v1/attachments/${attachment.id}`,
      {
        responseType: "blob",
      },
    );

    return new File(
      [response.data],
      'contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] || "download"',
      {
        type: response.headers["content-type"] || "application/octet-stream",
      },
    );
  }
}
