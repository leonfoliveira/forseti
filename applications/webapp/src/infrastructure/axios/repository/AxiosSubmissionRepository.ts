import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/port/output/repository/SubmissionRepository";
import { CreateSubmissionRequestDTO } from "@/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

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
  ): Promise<SubmissionWithCodeResponseDTO> {
    const response = await this.axiosClient.put<SubmissionWithCodeResponseDTO>(
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
  ): Promise<SubmissionWithCodeResponseDTO> {
    const response = await this.axiosClient.put<SubmissionWithCodeResponseDTO>(
      `${this.basePath(contestId)}/${submissionId}:rerun`,
    );
    return response.data;
  }
}
