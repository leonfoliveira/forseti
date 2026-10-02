import { SessionSlice } from "@/app/_lib/store/slice/SessionSlice";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("SessionSlice", () => {
  it("sets a session and clears it to null", () => {
    const session = MockSessionResponseDTO();
    expect(SessionSlice.reducer(undefined, SessionSlice.actions.set(session))).toEqual(session);
    expect(SessionSlice.reducer(session, SessionSlice.actions.clear())).toBeNull();
  });
});
