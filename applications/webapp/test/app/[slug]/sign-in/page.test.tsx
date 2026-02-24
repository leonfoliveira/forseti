import { fireEvent, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { act } from "react";

import SignInPage from "@/app/[slug]/sign-in/page";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SignInPage", () => {
  const mockContestMetadata = MockContestResponseDTO({
    id: "contest-1",
    slug: "test-contest",
  });

  it("should render the sign-in form with all required elements", async () => {
    await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
    });

    expect(document.title).toBe("Forseti - Sign In");

    expect(screen.getByTestId("title")).toHaveTextContent("Sign in");
    expect(screen.getByTestId("subtitle")).toHaveTextContent(
      "Enter your credentials to access the contest",
    );
    expect(screen.getByTestId("login")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in")).toBeInTheDocument();
    expect(screen.getByTestId("enter-guest")).toBeInTheDocument();
  });

  it("should show expired session warning if session has expired", async () => {
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue("true"),
    });
    await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
    });

    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should sign-in successfully", async () => {
    const session = MockSession();
    (
      Composition.authenticationWritter.authenticate as jest.Mock
    ).mockResolvedValue(session);

    await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
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

    expect(Composition.authenticationWritter.authenticate).toHaveBeenCalledWith(
      mockContestMetadata.id,
      {
        login: "testuser",
        password: "testpassword",
      },
    );
  });

  it("should handle unauthorized exception", async () => {
    (
      Composition.authenticationWritter.authenticate as jest.Mock
    ).mockRejectedValue(new UnauthorizedException("Wrong login or password."));

    const { store } = await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
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
    expect(store.getState().session).toBeNull();
    expect(screen.getAllByText("Wrong login or password")).toHaveLength(2);
  });

  it("should handle error", async () => {
    (
      Composition.authenticationWritter.authenticate as jest.Mock
    ).mockRejectedValue(new Error("An error occurred"));

    const { store } = await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
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
    expect(store.getState().session).toBeNull();
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should enter as guest", async () => {
    await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("enter-guest"));
    });

    expect(Composition.sessionWritter.deleteCurrent).toHaveBeenCalled();
  });

  it("should handle error when entering as guest", async () => {
    (Composition.sessionWritter.deleteCurrent as jest.Mock).mockRejectedValue(
      new Error("An error occurred"),
    );

    await renderWithProviders(<SignInPage />, {
      contest: mockContestMetadata,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("enter-guest"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
