import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";

export interface ContestReader {
  /**
   * Find a contest by its slug.
   *
   * @param slug Slug of the contest
   * @return The contest data
   */
  findBySlug(slug: string): Promise<ContestResponseDTO>;
}
