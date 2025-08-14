import { act, fireEvent, render, screen } from "@testing-library/react";

import RootSignInPage from "@/app/root/sign-in/page";
import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import {
  mockAlert,
  mockClearAuthorization,
  mockRouter,
  mockSetAuthorization,
} from "@/test/jest.setup";

describe("RootSignInPage", () => {
  it("renders the sign-in form", () => {
    render(<RootSignInPage />);

    expect(mockClearAuthorization).not.toHaveBeenCalled();
    expect(screen.getByTestId("title")).toHaveTextContent("Sign In");
    expect(screen.getByTestId("description")).toHaveTextContent("Root");
    expect(screen.getByTestId("password")).toBeEnabled();
    expect(screen.getByTestId("sign-in")).toHaveTextContent("Sign In");
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
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage: "Wrong password",
      id: "app.root.sign-in.page.wrong-password",
    });
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
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "An error occurred while signing in",
      id: "app.root.sign-in.page.sign-in-error",
    });
  });

  it("should redirect to root on successful sign-in", async () => {
    const authorization = { accessToken: "token" } as any;
    (authenticationService.authenticateRoot as jest.Mock).mockResolvedValueOnce(
      authorization,
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockSetAuthorization).toHaveBeenCalledWith(authorization);
    expect(mockRouter.push).toHaveBeenCalledWith(routes.ROOT);
  });
});
