import { authorizationSlice } from "@/store/slices/authorization-slice";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";

describe("authorizationSlice", () => {
  it("should set authorization", () => {
    const authorization = MockAuthorization();
    const state = authorizationSlice.reducer(
      null,
      authorizationSlice.actions.set(authorization),
    );
    expect(state).toEqual(authorization);
  });
});
