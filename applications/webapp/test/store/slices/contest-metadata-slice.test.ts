import { ContestMetadataResponseDTO } from "@/core/port/driven/repository/dto/response/contest/ContestMetadataResponseDTO";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";

describe("contestMetadataSlice", () => {
  it("should set contest metadata", () => {
    const metadata = MockContestMetadataResponseDTO();
    const state = contestMetadataSlice.reducer(
      null as unknown as ContestMetadataResponseDTO,
      contestMetadataSlice.actions.set(metadata),
    );
    expect(state).toEqual(metadata);
  });
});
