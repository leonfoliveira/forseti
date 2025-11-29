import { CreateClarificationRequestDTO } from "@/core/port/dto/request/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationWritter {
  /**
   * Create a new clarification for a contest.
   *
   * @param contestId ID of the contest
   * @param inputDTO Data for creating the clarification
   * @return The created clarification
   */
  create(
    contestId: string,
    inputDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;

  /**
   * Delete a clarification by its ID for a contest.
   *
   * @param contestId ID of the contest
   * @param clarificationId ID of the clarification to delete
   */
  deleteById(contestId: string, clarificationId: string): Promise<void>;
}
