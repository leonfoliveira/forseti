import { fireEvent, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import React, { act } from "react";

import SignInPage from "@/app/[slug]/sign-in/page";
import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useToast } from "@/lib/util/toast-hook";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SignInPage", () => {
  const mockContestMetadata = MockContestMetadataResponseDTO({
    id: "contest-1",
    slug: "test-contest",
  });

  it("should render the sign-in form with all required elements", async () => {
    await renderWithProviders(<SignInPage />, {
      contestMetadata: mockContestMetadata,
    });

    expect(document.title).toBe("Judge - Sign In");

    expect(screen.getByTestId("title")).toHaveTextContent("Sign in");
    expect(screen.getByTestId("subtitle")).toHaveTextContent(
      "Enter your credentials to access the contest",
    );
    expect(screen.getByTestId("login")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in")).toBeInTheDocument();
    expect(screen.getByTestId("enter-guest")).toBeInTheDocument();
  });

  it("should sign-in successfully and update Redux state", async () => {
    const authorization = MockAuthorization();
    (authenticationService.authenticate as jest.Mock).mockResolvedValue(
      authorization,
    );

    const { store } = await renderWithProviders(<SignInPage />, {
      contestMetadata: mockContestMetadata,
    });

    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "testpassword" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });

    expect(authenticationService.authenticate).toHaveBeenCalledWith({
      contestId: mockContestMetadata.id,
      login: "testuser",
      password: "testpassword",
    });

    expect(useRouter().push).toHaveBeenCalledWith(
      routes.CONTEST(mockContestMetadata.slug),
    );

    expect(store.getState().authorization).toEqual(authorization);
  });

  it("should handle unauthorized exception", async () => {
    (authenticationService.authenticate as jest.Mock).mockRejectedValue(
      new UnauthorizedException("Wrong login or password."),
    );

    const { store } = await renderWithProviders(<SignInPage />, {
      contestMetadata: mockContestMetadata,
    });

    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "testpassword" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });

    expect(useRouter().push).not.toHaveBeenCalled();
    expect(store.getState().authorization).toBeNull();
    expect(screen.getAllByText("Wrong login or password")).toHaveLength(2);
  });

  it("should handle error", async () => {
    (authenticationService.authenticate as jest.Mock).mockRejectedValue(
      new Error("An error occurred"),
    );

    const { store } = await renderWithProviders(<SignInPage />, {
      contestMetadata: mockContestMetadata,
    });

    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "testpassword" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });

    expect(useRouter().push).not.toHaveBeenCalled();
    expect(store.getState().authorization).toBeNull();
    expect(useToast().error).toHaveBeenCalled();
  });
});
