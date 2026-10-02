import { ContestSlice } from "@/app/_lib/store/slice/ContestSlice";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

describe("ContestSlice", () => {
  it("replaces contest state with the supplied contest", () => {
    const contest = MockContestResponseDTO();
    expect(ContestSlice.reducer(undefined, ContestSlice.actions.set(contest))).toEqual(contest);
  });
});
