import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";

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
  ): Promise<ContestFullResponseDTO>;

  /**
   * Force start a contest immediately.
   *
   * @param contestId ID of the contest to start
   * @return The updated contest metadata
   */
  forceStart(contestId: string): Promise<ContestMetadataResponseDTO>;

  /**
   * Force end a contest immediately.
   *
   * @param contestId ID of the contest to end
   * @return The updated contest metadata
   */
  forceEnd(contestId: string): Promise<ContestMetadataResponseDTO>;
}
