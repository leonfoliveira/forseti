import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { CreateSubmissionRequestDTO } from "@/core/port/driven/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";

export class AxiosSubmissionRepository implements SubmissionRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/submissions`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async createSubmission(
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

  async findAllContestSubmissions(
    contestId: string,
  ): Promise<SubmissionPublicResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      this.basePath(contestId),
    );
    return response.data;
  }

  async findAllContestFullSubmissions(
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
      `${this.basePath(contestId)}/full/members/me`,
    );
    return response.data;
  }

  async updateSubmissionAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<void> {
    await this.axiosClient.put<void>(
      `${this.basePath(contestId)}/${submissionId}/answer/${answer}/force`,
    );
  }

  async rerunSubmission(
    contestId: string,
    submissionId: string,
  ): Promise<void> {
    await this.axiosClient.post<void>(
      `${this.basePath(contestId)}/${submissionId}/rerun`,
    );
  }
}
