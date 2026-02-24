import { contestSlice } from "@/app/_store/slices/contest-slice";
import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";

describe("contestSlice", () => {
  it("should set contest metadata", () => {
    const metadata = MockContestResponseDTO();
    const state = contestSlice.reducer(
      null as unknown as ContestResponseDTO,
      contestSlice.actions.set(metadata),
    );
    expect(state).toEqual(metadata);
  });
});
