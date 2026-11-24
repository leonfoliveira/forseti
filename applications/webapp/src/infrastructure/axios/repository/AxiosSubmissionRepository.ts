import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { CreateSubmissionRequestDTO } from "@/port/dto/request/submission/CreateSubmissionRequestDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { SubmissionRepository } from "@/port/output/repository/SubmissionRepository";

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
      await this.axiosClient.patch<SubmissionWithCodeAndExecutionsResponseDTO>(
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
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO> {
    const response =
      await this.axiosClient.patch<SubmissionWithCodeAndExecutionsResponseDTO>(
        `${this.basePath(contestId)}/${submissionId}:resubmit`,
      );
    return response.data;
  }
}
