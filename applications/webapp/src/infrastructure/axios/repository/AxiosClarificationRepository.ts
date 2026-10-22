import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { AnswerClarificationRequestDTO } from "@/port/dto/request/clarification/AnswerClarificationRequestDTO";
import { CreateClarificationRequestDTO } from "@/port/dto/request/clarification/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ClarificationRepository } from "@/port/output/repository/ClarificationRepository";

export class AxiosClarificationRepository implements ClarificationRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/clarifications`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO> {
    const response = await this.axiosClient.post<ClarificationResponseDTO>(
      this.basePath(contestId),
      { data: requestDTO },
    );
    return response.data;
  }
  async answer(
    contestId: string,
    clarificationId: string,
    requestDTO: AnswerClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO> {
    const response = await this.axiosClient.patch<ClarificationResponseDTO>(
      `${this.basePath(contestId)}/${clarificationId}/answer`,
      { data: requestDTO },
    );
    return response.data;
  }
  async publish(
    contestId: string,
    clarificationId: string,
  ): Promise<ClarificationResponseDTO> {
    const response = await this.axiosClient.patch<ClarificationResponseDTO>(
      `${this.basePath(contestId)}/${clarificationId}/publish`,
    );
    return response.data;
  }
}
