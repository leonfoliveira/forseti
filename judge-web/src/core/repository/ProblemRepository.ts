import { ProblemResponseDTO } from "@/core/repository/dto/response/ProblemResponseDTO";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";

export interface ProblemRepository {
  findById(id: number): Promise<ProblemResponseDTO>;

  createSubmission(
    id: number,
    requestDTO: CreateSubmissionRequestDTO,
  ): Promise<SubmissionResponseDTO>;
}
