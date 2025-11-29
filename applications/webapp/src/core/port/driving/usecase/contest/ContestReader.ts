import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";

export interface ContestReader {
  /**
   * Find contest metadata by its slug.
   *
   * @param slug Slug of the contest
   * @return The contest metadata
   */
  findMetadataBySlug(slug: string): Promise<ContestMetadataResponseDTO>;
}
