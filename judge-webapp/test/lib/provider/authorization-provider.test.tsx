import { act, render, screen } from "@testing-library/react";

import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AuthorizationProvider } from "@/lib/provider/authorization-provider";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { mockAppDispatch, mockUseAppSelector } from "@/test/jest.setup";

jest.mock("@/lib/provider/authorization-provider", () =>
  jest.requireActual("@/lib/provider/authorization-provider"),
);

jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <div data-testid="error">Error occurred</div>,
}));

describe("AuthorizationProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock for authorization slice state
    mockUseAppSelector.mockImplementation((selector) => {
      const state = {
        authorization: {
          isLoading: true,
          error: null,
          data: null,
        },
      };
      return selector(state);
    });
  });

  it("renders error page when authorization fails to load", async () => {
    mockUseAppSelector.mockImplementation((selector) => {
      const state = {
        authorization: {
          isLoading: false,
          error: new Error("Failed to load authorization"),
          data: null,
        },
      };
      return selector(state);
    });

    (authenticationService.getAuthorization as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to load authorization"),
    );

    await act(async () => {
      render(
        <AuthorizationProvider>
          <div>Child Component</div>
        </AuthorizationProvider>,
      );
    });

    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("renders children when authorization loads successfully", async () => {
    mockUseAppSelector.mockImplementation((selector) => {
      const state = {
        authorization: {
          isLoading: false,
          error: null,
          data: { member: { id: "test-member" } },
        },
      };
      return selector(state);
    });

    (authenticationService.getAuthorization as jest.Mock).mockResolvedValue({
      member: { id: "test-member" },
    });

    await act(async () => {
      render(
        <AuthorizationProvider>
          <div data-testid="child">Child Component</div>
        </AuthorizationProvider>,
      );
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("sets new authorization and updates context", async () => {
    const mockAuthorization = {
      member: {
        id: "new-member-id",
        contestId: "contest-123",
        name: "Test Member",
        type: "CONTESTANT" as any,
      },
      expiresAt: "2024-12-31T23:59:59Z",
    };

    (authenticationService.getAuthorization as jest.Mock).mockResolvedValue(
      mockAuthorization,
    );

    await act(async () => {
      render(
        <AuthorizationProvider>
          <div data-testid="child">Child Component</div>
        </AuthorizationProvider>,
      );
    });

    expect(mockAppDispatch).toHaveBeenCalledWith(
      authorizationSlice.actions.success(mockAuthorization),
    );
  });

  it("clears authorization and updates context", async () => {
    (authenticationService.getAuthorization as jest.Mock).mockRejectedValue(
      new UnauthorizedException("Unauthorized"),
    );

    await act(async () => {
      render(
        <AuthorizationProvider>
          <div data-testid="child">Child Component</div>
        </AuthorizationProvider>,
      );
    });

    expect(mockAppDispatch).toHaveBeenCalledWith(
      authorizationSlice.actions.success(null),
    );
  });
});
