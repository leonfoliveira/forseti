import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationRepository {
  createClarification(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;

  deleteById(contestId: string, clarificationId: string): Promise<void>;
}
