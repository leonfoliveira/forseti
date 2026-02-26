import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export interface ContestRepository {
  /**
   * Update a contest.
   *
   * @param contestId ID of the contest to be updated
   * @param requestDTO Contest update request data
   * @returns The updated contest
   */
  update(
    contestId: string,
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestWithMembersAndProblemsDTO>;

  /**
   * Find contest by its Slug.
   *
   * @param slug Slug of the contest
   * @returns The contest
   */
  findBySlug(slug: string): Promise<ContestResponseDTO>;

  /**
   * Force start a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest
   */
  forceStart(contestId: string): Promise<ContestWithMembersAndProblemsDTO>;

  /**
   * Force end a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest
   */
  forceEnd(contestId: string): Promise<ContestWithMembersAndProblemsDTO>;
}
