import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { CreateSubmissionRequestDTO } from "@/core/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosSubmissionRepository implements SubmissionRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/submissions`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionWithCodeResponseDTO> {
    const response = await this.axiosClient.post<SubmissionWithCodeResponseDTO>(
      this.basePath(contestId),
      {
        data: request,
      },
    );
    return response.data;
  }

  async updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO> {
    const response =
      await this.axiosClient.put<SubmissionWithCodeAndExecutionsResponseDTO>(
        `${this.basePath(contestId)}/${submissionId}:update-answer`,
        {
          data: { answer },
        },
      );
    return response.data;
  }

  async rerun(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO> {
    const response =
      await this.axiosClient.put<SubmissionWithCodeAndExecutionsResponseDTO>(
        `${this.basePath(contestId)}/${submissionId}:rerun`,
      );
    return response.data;
  }
}
