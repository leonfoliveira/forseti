import { sessionSlice } from "@/app/_store/slices/session-slice";
import { MockSession } from "@/test/mock/response/session/MockSession";

describe("sessionSlice", () => {
  it("should set session", () => {
    const session = MockSession();
    const state = sessionSlice.reducer(null, sessionSlice.actions.set(session));
    expect(state).toEqual(session);
  });

  it("should clear session", () => {
    const session = MockSession();
    const stateWithSession = sessionSlice.reducer(
      null,
      sessionSlice.actions.set(session),
    );
    const clearedState = sessionSlice.reducer(
      stateWithSession,
      sessionSlice.actions.clear(),
    );
    expect(clearedState).toBeNull();
  });
});
