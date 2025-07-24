import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  AuthorizationProvider,
  useAuthorization,
} from "@/app/_component/context/authorization-context";
import { authorizationService } from "@/config/composition";

jest.mock("@/app/_component/context/authorization-context", () =>
  jest.requireActual("@/app/_component/context/authorization-context"),
);

jest.mock("@/app/_component/page/loading-page", () => ({
  LoadingPage: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock("@/app/_component/page/error-page", () => ({
  ErrorPage: () => <div data-testid="error">Error occurred</div>,
}));

describe("AuthorizationProvider", () => {
  it("renders error page when authorization fails to load", async () => {
    (authorizationService.getAuthorization as jest.Mock).mockImplementation(
      () => {
        throw new Error("Failed to load");
      },
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
    (authorizationService.getAuthorization as jest.Mock).mockReturnValue({
      token: "test-token",
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
      const { setAuthorization, authorization } = useAuthorization();
      return (
        <div>
          <button
            onClick={() =>
              setAuthorization({ accessToken: "new-token" } as any)
            }
            data-testid="set-authorization"
          >
            Set Authorization
          </button>
          <span data-testid="access-token">{authorization?.accessToken}</span>
        </div>
      );
    };

    (authorizationService.getAuthorization as jest.Mock).mockReturnValue(
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

    expect(screen.getByTestId("access-token")).toBeInTheDocument();
    expect(authorizationService.setAuthorization).toHaveBeenCalledWith({
      accessToken: "new-token",
    });
  });

  it("clears authorization and updates context", async () => {
    const TestComponent = () => {
      const { clearAuthorization, authorization } = useAuthorization();
      return (
        <div>
          <button
            onClick={clearAuthorization}
            data-testid="clear-authorization"
          >
            Clear Authorization
          </button>
          <span data-testid="access-token">
            {authorization?.accessToken || "No Authorization"}
          </span>
        </div>
      );
    };

    (authorizationService.getAuthorization as jest.Mock).mockReturnValue({
      accessToken: "test-token",
    });

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

    expect(screen.getByTestId("access-token")).toBeInTheDocument();
    expect(authorizationService.deleteAuthorization).toHaveBeenCalled();
  });
});
