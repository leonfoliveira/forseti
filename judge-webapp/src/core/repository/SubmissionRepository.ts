import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

export interface SubmissionRepository {
  createSubmission(
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO>;

  findAllFullForMember(): Promise<SubmissionFullResponseDTO[]>;

  updateSubmissionAnswer(
    id: string,
    data: UpdateSubmissionAnswerRequestDTO,
  ): Promise<void>;

  rerunSubmission(id: string): Promise<void>;
}
