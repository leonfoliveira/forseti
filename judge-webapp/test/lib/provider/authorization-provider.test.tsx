import { act, fireEvent, render, screen } from "@testing-library/react";

import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import {
  AuthorizationProvider,
  useSetAuthorization,
} from "@/lib/provider/authorization-provider";
import {
  authorizationSlice,
  useAuthorization,
} from "@/store/slices/authorization-slice";
import { mockAppDispatch } from "@/test/jest.setup";

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
  it("renders error page when authorization fails to load", async () => {
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
    (authenticationService.getAuthorization as jest.Mock).mockResolvedValue({
      member: {},
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
    const TestComponent = () => {
      const authorization = useAuthorization();
      const { setAuthorization } = useSetAuthorization();
      return (
        <div>
          <button
            onClick={() =>
              setAuthorization({ member: { id: "new-member-id" } } as any)
            }
            data-testid="set-authorization"
          >
            Set Authorization
          </button>
          <span data-testid="member">{authorization?.member.id}</span>
        </div>
      );
    };

    (authenticationService.getAuthorization as jest.Mock).mockResolvedValue(
      undefined,
    );

    await act(async () => {
      render(
        <AuthorizationProvider>
          <TestComponent />
        </AuthorizationProvider>,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("set-authorization"));
    });

    expect(mockAppDispatch).toHaveBeenCalledWith(
      authorizationSlice.actions.set({
        member: { id: "new-member-id" },
      } as any),
    );
  });

  it("clears authorization and updates context", async () => {
    const TestComponent = () => {
      const { clearAuthorization } = useSetAuthorization();
      return (
        <div>
          <button
            onClick={() => clearAuthorization(routes.ROOT_SIGN_IN)}
            data-testid="clear-authorization"
          >
            Clear Authorization
          </button>
        </div>
      );
    };

    await act(async () => {
      render(
        <AuthorizationProvider>
          <TestComponent />
        </AuthorizationProvider>,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("clear-authorization"));
    });

    expect(authenticationService.cleanAuthorization).toHaveBeenCalled();
  });
});
