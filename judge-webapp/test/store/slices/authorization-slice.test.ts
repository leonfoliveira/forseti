import { MemberType } from "@/core/domain/enumerate/MemberType";
import {
  Authorization,
  AuthorizationMember,
} from "@/core/domain/model/Authorization";
import { authorizationSlice } from "@/store/slices/authorization-slice";

describe("authorizationSlice", () => {
  const makeAuthorization = (member: AuthorizationMember): Authorization => ({
    member,
    expiresAt: "2024-12-31T23:59:59Z",
  });

  const makeMember = (
    overrides: Partial<AuthorizationMember> = {},
  ): AuthorizationMember => ({
    id: "123e4567-e89b-12d3-a456-426614174000",
    contestId: "contest-123",
    name: "Test User",
    type: MemberType.CONTESTANT,
    ...overrides,
  });

  it("should set authorization when payload is provided", () => {
    const initialState = null;
    const member = makeMember();
    const authorization = makeAuthorization(member);
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.set(authorization),
    );
    expect(state).toEqual(authorization);
    expect(state?.member.name).toBe("Test User");
    expect(state?.member.type).toBe(MemberType.CONTESTANT);
  });

  it("should set authorization to null when payload is null", () => {
    const member = makeMember();
    const authorization = makeAuthorization(member);
    const initialState = authorization;
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.set(null),
    );
    expect(state).toBeNull();
  });

  it("should handle setting different authorization types", () => {
    const initialState = null;
    const rootMember = makeMember({
      name: "Root User",
      type: MemberType.ROOT,
      id: "root-123",
    });
    const rootAuthorization = makeAuthorization(rootMember);
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.set(rootAuthorization),
    );
    expect(state?.member.type).toBe(MemberType.ROOT);
    expect(state?.member.name).toBe("Root User");
  });

  it("should handle setting judge authorization", () => {
    const initialState = null;
    const judgeMember = makeMember({
      name: "Judge User",
      type: MemberType.JUDGE,
      id: "judge-456",
    });
    const judgeAuthorization = makeAuthorization(judgeMember);
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.set(judgeAuthorization),
    );
    expect(state?.member.type).toBe(MemberType.JUDGE);
    expect(state?.member.name).toBe("Judge User");
  });

  it("should replace existing authorization with new one", () => {
    const oldMember = makeMember({ name: "Old User" });
    const oldAuthorization = makeAuthorization(oldMember);
    const newMember = makeMember({ name: "New User", id: "new-123" });
    const newAuthorization = makeAuthorization(newMember);

    const state = authorizationSlice.reducer(
      oldAuthorization,
      authorizationSlice.actions.set(newAuthorization),
    );
    expect(state?.member.name).toBe("New User");
    expect(state?.member.id).toBe("new-123");
  });
});
