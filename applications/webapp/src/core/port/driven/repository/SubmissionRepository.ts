import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { CreateSubmissionRequestDTO } from "@/core/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export interface SubmissionRepository {
  /**
   * Create a submission for a specific contest.
   *
   * @param contestId ID of the contest
   * @param request Submission creation request data
   * @returns The created submission
   */
  create(
    contestId: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionWithCodeResponseDTO>;

  /**
   * Update the answer of a submission for a specific contest.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @param answer New answer for the submission
   * @return The updated submission with code and executions
   */
  updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO>;

  /**
   * Rerun a submission for a specific contest.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @return The rerun submission with code and executions
   */
  rerun(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO>;
}
