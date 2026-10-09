import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { CreateSubmissionRequestDTO } from "@/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

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
   * @returns The updated submission with code
   */
  updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO>;

  /**
   * Resubmit a submission for a specific contest.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @returns The resubmitted submission with code
   */
  resubmit(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO>;
}
