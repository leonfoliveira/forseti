import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

export function recalculateContests(
  contests: ContestMetadataResponseDTO[],
  newContest: ContestMetadataResponseDTO,
): ContestMetadataResponseDTO[] {
  return contests
    .map((it) => (it.id === newContest.id ? newContest : it))
    .sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    );
}
