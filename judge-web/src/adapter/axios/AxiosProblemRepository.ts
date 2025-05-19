import { ProblemRepository } from "@/core/repository/ProblemRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";
import { ProblemResponseDTO } from "@/core/repository/dto/response/ProblemResponseDTO";

export class AxiosProblemRepository implements ProblemRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  createSubmission(
    id: number,
    requestDTO: CreateSubmissionRequestDTO,
  ): Promise<SubmissionResponseDTO> {
    return this.axiosClient.post<SubmissionResponseDTO>(
      `/v1/problems/${id}/submissions`,
      requestDTO,
    );
  }

  findById(id: number): Promise<ProblemResponseDTO> {
    return this.axiosClient.get<ProblemResponseDTO>(`/v1/problems/${id}`);
  }
}
