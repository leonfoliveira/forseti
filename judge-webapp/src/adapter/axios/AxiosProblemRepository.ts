import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ProblemRepository } from "@/core/repository/ProblemRepository";

export class AxiosProblemRepository implements ProblemRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async createSubmission(
    id: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO> {
    const response = await this.axiosClient.post<SubmissionFullResponseDTO>(
      `/v1/problems/${id}/submissions`,
      {
        data: request,
      },
    );
    return response.data;
  }
}
