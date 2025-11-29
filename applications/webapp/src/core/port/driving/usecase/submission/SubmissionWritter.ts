import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";

export interface SubmissionWritter {
  /**
   * Create a submission for a contest.
   *
   * @param contestId ID of the contest
   * @param inputDTO Data for creating the submission
   * @return The created submission
   */
  create(
    contestId: string,
    inputDTO: CreateSubmissionInputDTO,
  ): Promise<SubmissionFullResponseDTO>;

  /**
   * Update the answer for a submission.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @param answer The new answer for the submission
   */
  updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<void>;

  /**
   * Reenqueue a submission for re-evaluation.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission to rerun
   */
  rerun(contestId: string, submissionId: string): Promise<void>;
}
