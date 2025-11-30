import { CreateClarificationRequestDTO } from "@/core/port/dto/request/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationRepository {
  /**
   * Create a clarification for a specific contest.
   *
   * @param contestId ID of the contest
   * @param requestDTO Clarification creation request data
   * @returns The created clarification
   */
  create(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;

  /**
   * Delete a clarification by its ID for a specific contest.
   *
   * @param contestId ID of the contest
   * @param clarificationId ID of the clarification to be deleted
   */
  deleteById(contestId: string, clarificationId: string): Promise<void>;
}
