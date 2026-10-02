import { makeStore } from "@/app/_lib/store/Store";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

describe("makeStore", () => {
  it("combines the app reducers and accepts preloaded state", () => {
    const contest = MockContestResponseDTO();
    const store = makeStore({ contest });
    expect(store.getState().contest).toEqual(contest);
    expect(store.getState().balloon).toEqual([]);
    expect(store.getState().session).toBeNull();
  });
});
