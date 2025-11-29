import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";

export interface ContestWritter {
  /**
   * Update contest details.
   *
   * @param inputDTO Data for updating the contest
   * @return The updated contest details
   */
  updateContest(
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
