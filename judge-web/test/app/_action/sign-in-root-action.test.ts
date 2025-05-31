import { renderHook, waitFor } from "@testing-library/react";
import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { authenticationService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useRootSignInAction } from "@/app/_action/sign-in-root-action";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/app/_composition", () => ({
  authenticationService: {
    authenticateRoot: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("useRootSignInAction", () => {
  const mockAlertWarning = jest.fn();
  const mockAlertError = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      warning: mockAlertWarning,
      error: mockAlertError,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
  });

  it("should sign in successfully and navigate to root", async () => {
    (authenticationService.authenticateRoot as jest.Mock).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useRootSignInAction());
    const { act: signInAction } = result.current;

    const input: RootSignInFormType = {
      username: "rootuser",
      password: "rootpassword",
    } as RootSignInFormType;

    await waitFor(async () => {
      await signInAction(input);
    });

    expect(authenticationService.authenticateRoot).toHaveBeenCalledWith(input);
    expect(mockRouterPush).toHaveBeenCalledWith("/root");
    expect(mockAlertWarning).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show a warning alert for UnauthorizedException", async () => {
    (authenticationService.authenticateRoot as jest.Mock).mockRejectedValue(
      new UnauthorizedException("Invalid credentials"),
    );

    const { result } = renderHook(() => useRootSignInAction());
    const { act: signInAction } = result.current;

    const input: RootSignInFormType = {
      username: "rootuser",
      password: "wrongpassword",
    } as RootSignInFormType;

    await waitFor(async () => {
      await signInAction(input);
    });

    expect(authenticationService.authenticateRoot).toHaveBeenCalledWith(input);
    expect(mockAlertWarning).toHaveBeenCalledWith("Invalid password");
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network error");
    (authenticationService.authenticateRoot as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useRootSignInAction());
    const { act: signInAction } = result.current;

    const input: RootSignInFormType = {
      username: "rootuser",
      password: "testpassword",
    } as RootSignInFormType;

    await waitFor(async () => {
      await signInAction(input);
    });

    expect(authenticationService.authenticateRoot).toHaveBeenCalledWith(input);
    expect(mockAlertError).toHaveBeenCalledWith("Error signing in");
    expect(mockAlertWarning).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
