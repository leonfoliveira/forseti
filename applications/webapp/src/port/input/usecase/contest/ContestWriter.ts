import { UpdateContestRequestDTO } from "@/port/dto/request/contest/UpdateContestRequestDTO";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";

export type UpdateContestInputDTO = Omit<
  UpdateContestRequestDTO,
  "problems"
> & {
  problems: (Omit<
    UpdateContestRequestDTO["problems"][number],
    "description" | "testCases"
  > & {
    description?: AttachmentResponseDTO;
    newDescription?: File;
    testCases?: AttachmentResponseDTO;
    newTestCases?: File;
  })[];
};

export interface ContestWritter {
  /**
   * Update contest details.
   *
   * @param contestId ID of the contest to be updated
   * @param inputDTO Data for updating the contest
   * @return The updated contest details
   */
  update(
    contestId: string,
    inputDTO: UpdateContestInputDTO,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Freeze the contest, preventing further submissions.
   *
   * @param contestId ID of the contest to freeze
   * @return The updated contest
   */
  freeze(contestId: string): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Unfreeze the contest, allowing submissions again.
   *
   * @param contestId ID of the contest to unfreeze
   * @return The updated contest
   */
  unfreeze(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Force start a contest immediately.
   *
   * @param contestId ID of the contest to start
   * @return The updated contest
   */
  forceStart(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Force end a contest immediately.
   *
   * @param contestId ID of the contest to end
   * @return The updated contest
   */
  forceEnd(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;
}
