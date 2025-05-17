import { ProblemFullResponseDTO } from "@/core/repository/dto/response/ProblemFullResponseDTO";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";

export interface ProblemRepository {
  findById(id: number): Promise<ProblemFullResponseDTO>;

  createSubmission(
    id: number,
    requestDTO: CreateSubmissionRequestDTO,
  ): Promise<SubmissionResponseDTO>;
}
