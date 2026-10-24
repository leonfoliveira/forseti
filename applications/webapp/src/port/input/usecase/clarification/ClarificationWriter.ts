import { CreateClarificationRequestDTO } from "@/port/dto/request/clarification/CreateClarificationRequestDTO";
import { AnswerClarificationRequestDTO } from "@/port/dto/request/clarification/AnswerClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationWritter {
  /**
   * Creates a new clarification for the specified contest.
   *
   * @param contestId The ID of the contest for which the clarification is being created.
   * @param requestDTO The data transfer object containing the details of the clarification request.
   */
  create(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;

  /**
   * Answers an existing clarification for the specified contest.
   *
   * @param contestId The ID of the contest to which the clarification belongs.
   * @param clarificationId The ID of the clarification being answered.
   * @param requestDTO The data transfer object containing the details of the answer.
   */
  answer(
    contestId: string,
    clarificationId: string,
    requestDTO: AnswerClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;

  /**
   * Publishes an existing clarification for the specified contest.
   *
   * @param contestId The ID of the contest to which the clarification belongs.
   * @param clarificationId The ID of the clarification being published.
   */
  publish(
    contestId: string,
    clarificationId: string,
  ): Promise<ClarificationResponseDTO>;
}
