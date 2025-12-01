import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { CreateSubmissionRequestDTO } from "@/core/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosSubmissionRepository implements SubmissionRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/submissions`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO> {
    const response = await this.axiosClient.post<SubmissionFullResponseDTO>(
      this.basePath(contestId),
      {
        data: request,
      },
    );
    return response.data;
  }

  async findAllForContest(
    contestId: string,
  ): Promise<SubmissionPublicResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      this.basePath(contestId),
    );
    return response.data;
  }

  async findAllFullForContest(
    contestId: string,
  ): Promise<SubmissionFullResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      `${this.basePath(contestId)}/full`,
    );
    return response.data;
  }

  async findAllFullForMember(
    contestId: string,
  ): Promise<SubmissionFullResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      `${this.basePath(contestId)}/members/me`,
    );
    return response.data;
  }

  async updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<void> {
    await this.axiosClient.put<void>(
      `${this.basePath(contestId)}/${submissionId}:update-answer-force`,
      {
        data: { answer },
      },
    );
  }

  async rerun(contestId: string, submissionId: string): Promise<void> {
    await this.axiosClient.post<void>(
      `${this.basePath(contestId)}/${submissionId}:rerun`,
    );
  }
}
