import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RootSignInPage from "@/app/root/sign-in/page";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useSearchParams } from "next/navigation";
import { authenticationService } from "@/app/_composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { alert, router } from "@/test/jest.setup";
import { Authorization } from "@/core/domain/model/Authorization";
import { routes } from "@/app/_routes";

jest.mock("@/app/_component/context/authorization-context", () => ({
  useAuthorization: jest.fn().mockReturnValue({
    setAuthorization: jest.fn(),
    clearAuthorization: jest.fn(),
  }),
}));

jest.mock("@/app/_composition", () => ({
  authenticationService: {
    authenticateRoot: jest.fn(),
  },
}));

describe("RootSignInPage", () => {
  it("renders the sign-in form", () => {
    render(<RootSignInPage />);

    expect(
      (useAuthorization as jest.Mock).mock.results[0].value.clearAuthorization,
    ).not.toHaveBeenCalled();
    expect(screen.getByTestId("title")).toHaveTextContent("title");
    expect(screen.getByTestId("description")).toHaveTextContent("description");
    expect(screen.getByTestId("password:label")).toHaveTextContent(
      "password:label",
    );
    expect(screen.getByTestId("sign-in")).toHaveTextContent("sign-in:label");
  });

  it("calls clearAuthorization on signOut", () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("true"),
    });

    render(<RootSignInPage />);

    expect(
      (useAuthorization as jest.Mock).mock.results[0].value.clearAuthorization,
    ).toHaveBeenCalled();
  });

  it("show warning on wrong password", async () => {
    (authenticationService.authenticateRoot as jest.Mock).mockRejectedValue(
      new UnauthorizedException("Unauthorized"),
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password:input"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByTestId("sign-in"));
    await waitFor(() => {
      expect(alert.warning).toHaveBeenCalled();
      expect(
        (useAuthorization as jest.Mock).mock.results[0].value.setAuthorization,
      ).not.toHaveBeenCalled();
    });
  });

  it("show error on other exceptions", async () => {
    (authenticationService.authenticateRoot as jest.Mock).mockRejectedValue(
      new Error("Some error"),
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password:input"), {
      target: { value: "some-password" },
    });
    fireEvent.click(screen.getByTestId("sign-in"));
    await waitFor(() => {
      expect(alert.error).toHaveBeenCalled();
      expect(
        (useAuthorization as jest.Mock).mock.results[0].value.setAuthorization,
      ).not.toHaveBeenCalled();
    });
  });

  it("redirects to root on successful sign-in", async () => {
    const authorization = { accessToken: "token" } as unknown as Authorization;
    (authenticationService.authenticateRoot as jest.Mock).mockResolvedValue(
      authorization,
    );

    render(<RootSignInPage />);

    fireEvent.change(screen.getByTestId("password:input"), {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByTestId("sign-in"));
    await waitFor(() => {
      expect(
        (useAuthorization as jest.Mock).mock.results[0].value.setAuthorization,
      ).toHaveBeenCalledWith(authorization);
      expect(router.push).toHaveBeenCalledWith(routes.ROOT);
    });
  });
});
