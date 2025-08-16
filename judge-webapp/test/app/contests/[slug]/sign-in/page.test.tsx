import { act, fireEvent, render, screen } from "@testing-library/react";

import MemberSignInPage from "@/app/contests/[slug]/sign-in/page";
import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { mockAlert, mockAppDispatch, mockRouter } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/store/slices/contest-metadata-slice", () => ({
  useContestMetadata: jest.fn(() => ({
    id: "contest-id",
    slug: "contest-slug",
    title: "Contest Title",
  })),
}));

describe("memberSignInPage", () => {
  it("renders the sign-in form", () => {
    render(<MemberSignInPage />);

    expect(screen.getByTestId("title")).toHaveTextContent("Sign In");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "Contest Title",
    );
    expect(screen.getByTestId("login")).toBeEnabled();
    expect(screen.getByTestId("password")).toBeEnabled();
    expect(screen.getByTestId("sign-in")).toHaveTextContent("Sign In");
  });

  it("should alert warning on unauthorized exception", async () => {
    (
      authenticationService.authenticateMember as jest.Mock
    ).mockRejectedValueOnce(new UnauthorizedException("unauthorized"));

    render(<MemberSignInPage />);

    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "wrong-login" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "wrong-password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage: "Wrong login or password",
      id: "app.contests.[slug].sign-in.page.wrong-login-password",
    });
  });

  it("should alert warning on other exception", async () => {
    (
      authenticationService.authenticateMember as jest.Mock
    ).mockRejectedValueOnce(new Error("error"));

    render(<MemberSignInPage />);

    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "wrong-login" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "wrong-password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Error signing in",
      id: "app.contests.[slug].sign-in.page.sign-in-error",
    });
  });

  it("should redirect to contest on successful sign-in", async () => {
    const authorization = { accessToken: "token" } as any;
    (
      authenticationService.authenticateMember as jest.Mock
    ).mockResolvedValueOnce(authorization);

    render(<MemberSignInPage />);

    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "login" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      authorizationSlice.actions.success(authorization),
    );
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.CONTEST("contest-slug"),
    );
  });
});
