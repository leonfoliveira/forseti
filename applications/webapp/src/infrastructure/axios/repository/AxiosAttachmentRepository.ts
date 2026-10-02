import { GetUploadSignedUrlRequest } from "@/port/dto/request/GetUploadSignedUrlRequest";
import { AttachmentRepository } from "@/port/output/repository/AttachmentRepository";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { SignedUploadAttachmentResponseDTO } from "@/port/dto/response/attachment/SignedUploadAttachmentResponseDTO";
import { SignedDownloadAttachmentResponseDTO } from "@/port/dto/response/attachment/SignedDownloadAttachmentResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

export class AxiosAttachmentRepository implements AttachmentRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/attachments`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async getUploadSignedUrl(
    contestId: string,
    requestDTO: GetUploadSignedUrlRequest,
  ): Promise<SignedUploadAttachmentResponseDTO> {
    const response =
      await this.axiosClient.post<SignedUploadAttachmentResponseDTO>(
        this.basePath(contestId),
        {
          data: requestDTO,
        },
      );
    return response.data;
  }

  async getDownloadSignedUrl(
    contestId: string,
    attachment: AttachmentResponseDTO,
  ): Promise<SignedDownloadAttachmentResponseDTO> {
    const response =
      await this.axiosClient.get<SignedDownloadAttachmentResponseDTO>(
        `${this.basePath(contestId)}/${attachment.id}`,
      );

    return response.data;
  }
}
