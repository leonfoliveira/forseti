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
    const initialState = {
      isLoading: true,
      error: null,
      data: null,
    } as const;
    const member = makeMember();
    const authorization = makeAuthorization(member);
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.success(authorization),
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data).toEqual(authorization);
    expect(state.data?.member.name).toBe("Test User");
    expect(state.data?.member.type).toBe(MemberType.CONTESTANT);
  });

  it("should set authorization to null when payload is null", () => {
    const member = makeMember();
    const authorization = makeAuthorization(member);
    const initialState = {
      isLoading: false,
      error: null,
      data: authorization,
    } as const;
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.success(null),
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data).toBeNull();
  });

  it("should handle setting different authorization types", () => {
    const initialState = {
      isLoading: true,
      error: null,
      data: null,
    } as const;
    const rootMember = makeMember({
      name: "Root User",
      type: MemberType.ROOT,
      id: "root-123",
    });
    const rootAuthorization = makeAuthorization(rootMember);
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.success(rootAuthorization),
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data?.member.type).toBe(MemberType.ROOT);
    expect(state.data?.member.name).toBe("Root User");
  });

  it("should handle setting judge authorization", () => {
    const initialState = {
      isLoading: true,
      error: null,
      data: null,
    } as const;
    const judgeMember = makeMember({
      name: "Judge User",
      type: MemberType.JUDGE,
      id: "judge-456",
    });
    const judgeAuthorization = makeAuthorization(judgeMember);
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.success(judgeAuthorization),
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data?.member.type).toBe(MemberType.JUDGE);
    expect(state.data?.member.name).toBe("Judge User");
  });

  it("should replace existing authorization with new one", () => {
    const oldMember = makeMember({ name: "Old User" });
    const oldAuthorization = makeAuthorization(oldMember);
    const initialState = {
      isLoading: false,
      error: null,
      data: oldAuthorization,
    } as const;
    const newMember = makeMember({ name: "New User", id: "new-123" });
    const newAuthorization = makeAuthorization(newMember);

    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.success(newAuthorization),
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data?.member.name).toBe("New User");
    expect(state.data?.member.id).toBe("new-123");
  });

  it("should handle fail action", () => {
    const member = makeMember();
    const authorization = makeAuthorization(member);
    const initialState = {
      isLoading: false,
      error: null,
      data: authorization,
    } as const;
    const error = new Error("Test error");
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.fail(error),
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
    expect(state.data).toBeNull();
  });

  it("should handle reset action", () => {
    const initialState = {
      isLoading: false,
      error: new Error("Previous error"),
      data: null,
    } as const;
    const state = authorizationSlice.reducer(
      initialState,
      authorizationSlice.actions.reset(),
    );
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.data).toBeNull();
  });
});
