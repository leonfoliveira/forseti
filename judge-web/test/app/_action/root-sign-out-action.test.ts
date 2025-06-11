import { renderHook, act } from "@testing-library/react";
import { authorizationService } from "@/app/_composition";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";

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

describe("useRootSignOutAction", () => {
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
    const { result } = renderHook(() => useRootSignOutAction());
    const { act: signOutAction } = result.current;

    await act(async () => {
      await signOutAction();
    });

    expect(mockDeleteAuthorization).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith("/root/sign-in");
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("should delete authorization and push to router when shouldRedirect is false", async () => {
    const { result } = renderHook(() => useRootSignOutAction());
    const { act: signOutAction } = result.current;

    await act(async () => {
      await signOutAction(false);
    });

    expect(mockDeleteAuthorization).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith("/root/sign-in");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
