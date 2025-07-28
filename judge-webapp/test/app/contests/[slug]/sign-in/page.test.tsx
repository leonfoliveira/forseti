import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  mockAlert,
  mockClearAuthorization,
  mockRouter,
  mockSearchParams,
  mockSetAuthorization,
} from "@/test/jest.setup";
import MemberSignInPage from "@/app/contests/[slug]/sign-in/page";
import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { routes } from "@/config/routes";

jest.mock("@/config/composition");
jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
    id: "contest-id",
    slug: "contest-slug",
    title: "Contest Title",
  })),
}));

describe("memberSignInPage", () => {
  it("renders the sign-in form", () => {
    render(<MemberSignInPage />);

    expect(mockClearAuthorization).not.toHaveBeenCalled();
    expect(screen.getByTestId("title")).toHaveTextContent("title");
    expect(screen.getByTestId("description")).toHaveTextContent(
      "Contest Title",
    );
    expect(screen.getByTestId("login")).toBeEnabled();
    expect(screen.getByTestId("password")).toBeEnabled();
    expect(screen.getByTestId("sign-in")).toHaveTextContent("sign-in:label");
  });

  it("clear authorization on signOut query param", () => {
    mockSearchParams.get.mockReturnValueOnce("true");

    render(<MemberSignInPage />);

    expect(mockClearAuthorization).toHaveBeenCalled();
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
    expect(mockAlert.warning).toHaveBeenCalledWith("unauthorized");
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
    expect(mockAlert.error).toHaveBeenCalledWith("error");
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
    expect(mockSetAuthorization).toHaveBeenCalledWith(authorization);
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.CONTEST("contest-slug"),
    );
  });
});
