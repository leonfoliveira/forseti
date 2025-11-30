import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";

export interface ContestRepository {
  /**
   * Update a contest.
   *
   * @param requestDTO Contest update request data
   * @returns The updated contest
   */
  update(requestDTO: UpdateContestRequestDTO): Promise<ContestFullResponseDTO>;

  /**
   * Find all contest metadata.
   *
   * @returns An array of contest metadata
   */
  findAllMetadata(): Promise<ContestMetadataResponseDTO[]>;

  /**
   * Find a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The public contest data
   */
  findById(contestId: string): Promise<ContestPublicResponseDTO>;

  /**
   * Find contest metadata by its Slug.
   *
   * @param slug Slug of the contest
   * @returns The contest metadata
   */
  findMetadataBySlug(slug: string): Promise<ContestMetadataResponseDTO>;

  /**
   * Find full contest details by its ID.
   *
   * @param contestId ID of the contest
   * @returns The full contest data
   */
  findFullById(contestId: string): Promise<ContestFullResponseDTO>;

  /**
   * Force start a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest metadata
   */
  forceStart(contestId: string): Promise<ContestMetadataResponseDTO>;

  /**
   * Force end a contest by its ID.
   *
   * @param contestId ID of the contest
   * @returns The updated contest metadata
   */
  forceEnd(contestId: string): Promise<ContestMetadataResponseDTO>;
}
