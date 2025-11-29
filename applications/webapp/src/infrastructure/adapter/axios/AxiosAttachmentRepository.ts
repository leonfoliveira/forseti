import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { AttachmentRepository } from "@/core/port/driven/repository/AttachmentRepository";

export class AxiosAttachmentRepository implements AttachmentRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/attachments`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async upload(
    contestId: string,
    context: AttachmentContext,
    file: File,
  ): Promise<AttachmentResponseDTO> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.axiosClient.post<AttachmentResponseDTO>(
      `${this.basePath(contestId)}/${context}`,
      {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  async download(
    contestId: string,
    attachment: AttachmentResponseDTO,
  ): Promise<File> {
    const response = await this.axiosClient.get<Blob>(
      `${this.basePath(contestId)}/${attachment.id}`,
      {
        responseType: "blob",
      },
    );

    return new File(
      [response.data],
      response.headers["content-disposition"]?.match(
        /filename="?([^"]+)"?/,
      )?.[1] || "download",
      {
        type: response.headers["content-type"] || "application/octet-stream",
      },
    );
  }
}
