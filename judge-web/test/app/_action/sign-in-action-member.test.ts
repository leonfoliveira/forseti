import { renderHook, waitFor } from "@testing-library/react";
import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { authenticationService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useMemberSignInAction } from "@/app/_action/sign-in-action-member";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/app/_composition", () => ({
  authenticationService: {
    authenticateMember: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("useMemberSignInAction", () => {
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

  it("should sign in successfully and navigate", async () => {
    (authenticationService.authenticateMember as jest.Mock).mockResolvedValue(
      undefined,
    );

    const { result } = renderHook(() => useMemberSignInAction());
    const { act: signInAction } = result.current;

    const contestId = 123;
    const input: MemberSignInFormType = {
      username: "testuser",
      password: "testpassword",
    } as unknown as MemberSignInFormType;

    await waitFor(async () => {
      await signInAction(contestId, input);
    });

    expect(authenticationService.authenticateMember).toHaveBeenCalledWith(
      contestId,
      input,
    );
    expect(mockRouterPush).toHaveBeenCalledWith(`/contests/${contestId}`);
    expect(mockAlertWarning).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show a warning alert for UnauthorizedException", async () => {
    (authenticationService.authenticateMember as jest.Mock).mockRejectedValue(
      new UnauthorizedException("Invalid credentials"),
    );

    const { result } = renderHook(() => useMemberSignInAction());
    const { act: signInAction } = result.current;

    const contestId = 123;
    const input: MemberSignInFormType = {
      username: "testuser",
      password: "wrongpassword",
    } as unknown as MemberSignInFormType;

    await waitFor(async () => {
      await signInAction(contestId, input);
    });

    expect(authenticationService.authenticateMember).toHaveBeenCalledWith(
      contestId,
      input,
    );
    expect(mockAlertWarning).toHaveBeenCalledWith("Invalid password");
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network error");
    (authenticationService.authenticateMember as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useMemberSignInAction());
    const { act: signInAction } = result.current;

    const contestId = 123;
    const input: MemberSignInFormType = {
      username: "testuser",
      password: "testpassword",
    } as unknown as MemberSignInFormType;

    await waitFor(async () => {
      await signInAction(contestId, input);
    });

    expect(authenticationService.authenticateMember).toHaveBeenCalledWith(
      contestId,
      input,
    );
    expect(mockAlertError).toHaveBeenCalledWith("Error signing in");
    expect(mockAlertWarning).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
