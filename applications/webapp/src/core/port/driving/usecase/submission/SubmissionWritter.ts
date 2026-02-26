import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type CreateSubmissionInputDTO = {
  problemId: string;
  language: SubmissionLanguage;
  code: File;
};

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
  ): Promise<SubmissionWithCodeResponseDTO>;

  /**
   * Update the answer for a submission.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @param answer The new answer for the submission
   * @return The updated submission with code and executions
   */
  updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO>;

  /**
   * Reenqueue a submission for re-evaluation.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission to rerun
   * @return The submission with code and executions after rerunning
   */
  rerun(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO>;
}
