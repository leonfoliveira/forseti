import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { CreateSubmissionRequestDTO } from "@/core/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

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
  ): Promise<SubmissionFullResponseDTO>;

  /**
   * Find all submissions for a specific contest.
   *
   * @param contestId ID of the contest
   * @returns An array of public submission data
   */
  findAllForContest(contestId: string): Promise<SubmissionPublicResponseDTO[]>;

  /**
   * Find all full submissions for a specific contest.
   *
   * @param contestId ID of the contest
   * @returns An array of full submission data
   */
  findAllFullForContest(
    contestId: string,
  ): Promise<SubmissionFullWithExecutionResponseDTO[]>;

  /**
   * Find all full submissions for a specific contest for the current member.
   *
   * @param contestId ID of the contest
   * @returns An array of full submission data for the member
   */
  findAllFullForMember(contestId: string): Promise<SubmissionFullResponseDTO[]>;

  /**
   * Update the answer of a submission for a specific contest.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @param answer New answer for the submission
   */
  updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<void>;

  /**
   * Rerun a submission for a specific contest.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   */
  rerun(contestId: string, submissionId: string): Promise<void>;
}
