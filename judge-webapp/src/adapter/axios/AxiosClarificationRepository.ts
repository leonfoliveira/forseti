import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { ClarificationRepository } from "@/core/repository/ClarificationRepository";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export class AxiosClarificationRepository implements ClarificationRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/clarifications`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async createClarification(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO> {
    const response = await this.axiosClient.post<ClarificationResponseDTO>(
      this.basePath(contestId),
      { data: requestDTO },
    );
    return response.data;
  }

  async deleteById(contestId: string, clarificationId: string): Promise<void> {
    await this.axiosClient.delete(
      `${this.basePath(contestId)}/${clarificationId}`,
    );
  }
}
