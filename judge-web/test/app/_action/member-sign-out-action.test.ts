import { renderHook, act } from "@testing-library/react";
import { authorizationService } from "@/app/_composition";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  authorizationService: {
    deleteAuthorization: jest.fn(),
  },
}));

describe("useMemberSignOutAction", () => {
  const mockDeleteAuthorization = jest.fn();
  const mockRouterPush = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authorizationService.deleteAuthorization as jest.Mock).mockImplementation(
      mockDeleteAuthorization,
    );
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    (redirect as unknown as jest.Mock).mockImplementation(mockRedirect);
  });

  it("should delete authorization and redirect by default", async () => {
    const { result } = renderHook(() => useMemberSignOutAction());
    const { act: signOutAction } = result.current;

    const contestId = 123;
    await act(async () => {
      await signOutAction(contestId);
    });

    expect(mockDeleteAuthorization).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith(`/auth/contests/${contestId}`);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("should delete authorization and push to router when shouldRedirect is false", async () => {
    const { result } = renderHook(() => useMemberSignOutAction());
    const { act: signOutAction } = result.current;

    const contestId = 123;
    await act(async () => {
      await signOutAction(contestId, false);
    });

    expect(mockDeleteAuthorization).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(`/auth/contests/${contestId}`);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
