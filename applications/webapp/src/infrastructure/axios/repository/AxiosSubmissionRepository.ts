import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/port/output/repository/SubmissionRepository";
import { CreateSubmissionRequestDTO } from "@/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";

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
  ): Promise<SubmissionWithCodeAndExecutionResponseDTO> {
    const response =
      await this.axiosClient.put<SubmissionWithCodeAndExecutionResponseDTO>(
        `${this.basePath(contestId)}/${submissionId}:update-answer`,
        {
          data: { answer },
        },
      );
    return response.data;
  }

  async resubmit(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeAndExecutionResponseDTO> {
    const response =
      await this.axiosClient.put<SubmissionWithCodeAndExecutionResponseDTO>(
        `${this.basePath(contestId)}/${submissionId}:resubmit`,
      );
    return response.data;
  }
}
