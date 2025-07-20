import { act, fireEvent, render, screen } from "@testing-library/react";
import RootSignInPage from "@/app/root/sign-in/page";
import {
  mockAlert,
  mockClearAuthorization,
  mockRouter,
  mockSearchParams,
  mockSetAuthorization,
} from "@/test/jest.setup";
import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { routes } from "@/config/routes";

describe("RootSignInPage", () => {
  it("renders the sign-in form", () => {
    render(<RootSignInPage />);

    expect(mockClearAuthorization).not.toHaveBeenCalled();
    expect(screen.getByTestId("title")).toHaveTextContent("title");
    expect(screen.getByTestId("description")).toHaveTextContent("description");
    expect(screen.getByTestId("password")).toBeEnabled();
    expect(screen.getByTestId("sign-in")).toHaveTextContent("sign-in:label");
  });

  it("clear authorization on signOut query param", () => {
    mockSearchParams.get.mockReturnValueOnce("true");

    render(<RootSignInPage />);

    expect(mockClearAuthorization).toHaveBeenCalled();
  });

  it("should alert warning on unauthorized exception", async () => {
    (authenticationService.authenticateRoot as jest.Mock).mockRejectedValueOnce(
      new UnauthorizedException("UnauthorizedException"),
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "wrong-password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockAlert.warning).toHaveBeenCalledWith("unauthorized");
  });

  it("should alert error on other exceptions", async () => {
    (authenticationService.authenticateRoot as jest.Mock).mockRejectedValueOnce(
      new Error("Some error"),
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "wrong-password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith("error");
  });

  it("should redirect to root on successful sign-in", async () => {
    const authorization = { accessToken: "token" } as any;
    (authenticationService.authenticateRoot as jest.Mock).mockResolvedValueOnce(
      authorization,
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "wrong-password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockSetAuthorization).toHaveBeenCalledWith(authorization);
    expect(mockRouter.push).toHaveBeenCalledWith(routes.ROOT);
  });
});
