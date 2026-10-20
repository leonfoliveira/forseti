import { UpdateContestRequestDTO } from "@/port/dto/request/UpdateContestRequestDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";

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
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Find contest by its Slug.
   *
   * @param slug Slug of the contest
   * @returns The contest
   */
  findBySlug(slug: string): Promise<ContestResponseDTO>;

  /**
   * Freeze a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest
   */
  freeze(contestId: string): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Unfreeze a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest
   */
  unfreeze(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Force start a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest
   */
  forceStart(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;

  /**
   * Force end a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest
   */
  forceEnd(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO>;
}
