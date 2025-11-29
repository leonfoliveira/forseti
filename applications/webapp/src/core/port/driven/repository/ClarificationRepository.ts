import { CreateClarificationRequestDTO } from "@/core/port/driven/repository/dto/request/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/core/port/driven/repository/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationRepository {
  createClarification(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;

  deleteById(contestId: string, clarificationId: string): Promise<void>;
}
