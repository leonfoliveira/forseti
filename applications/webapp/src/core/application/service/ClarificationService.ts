import { ClarificationRepository } from "@/core/port/driven/repository/ClarificationRepository";
import { ClarificationWritter } from "@/core/port/driving/usecase/clarification/ClarificationWritter";
import { CreateClarificationRequestDTO } from "@/core/port/dto/request/CreateClarificationRequestDTO";

export class ClarificationService implements ClarificationWritter {
  constructor(
    private readonly clarificationRepository: ClarificationRepository,
  ) {}

  /**
   * Create a new clarification for a contest.
   *
   * @param contestId ID of the contest
   * @param inputDTO Data for creating the clarification
   * @return The created clarification
   */
  async create(contestId: string, inputDTO: CreateClarificationRequestDTO) {
    return await this.clarificationRepository.createClarification(
      contestId,
      inputDTO,
    );
  }

  /**
   * Delete a clarification by its ID for a contest.
   *
   * @param contestId ID of the contest
   * @param clarificationId ID of the clarification to delete
   */
  async deleteById(contestId: string, clarificationId: string): Promise<void> {
    await this.clarificationRepository.deleteById(contestId, clarificationId);
  }
}
