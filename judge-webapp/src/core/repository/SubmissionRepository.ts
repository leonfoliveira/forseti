import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";

export interface SubmissionRepository {
  findAllFullForMember(): Promise<SubmissionFullResponseDTO[]>;

  updateSubmissionAnswer(
    id: string,
    data: UpdateSubmissionAnswerRequestDTO,
  ): Promise<void>;

  rerunSubmission(id: string): Promise<void>;
}
