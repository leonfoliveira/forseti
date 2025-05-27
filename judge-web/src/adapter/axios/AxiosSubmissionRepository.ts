import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";

export class AxiosSubmissionRepository implements SubmissionRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async findAllForMember(): Promise<SubmissionPrivateResponseDTO[]> {
    const response =
      await this.axiosClient.get<SubmissionPrivateResponseDTO[]>(
        "/v1/submissions/me",
      );
    return response.data;
  }

  async createSubmission(
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionPrivateResponseDTO> {
    const response = await this.axiosClient.post<SubmissionPrivateResponseDTO>(
      "/v1/submissions",
      {
        data: request,
      },
    );
    return response.data;
  }
}
