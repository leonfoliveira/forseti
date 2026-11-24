import { act,fireEvent, screen } from "@testing-library/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useToast } from "@/app/_lib/hook/useToast";
import SignInPage from "@/app/[slug]/signIn/SignInPage";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { ServerException } from "@/domain/exception/ServerException";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";
import {
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SignInPage", () => {
  function fillForm() {
    fireEvent.change(screen.getByTestId("login"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password" },
    });
  }

  it("renders form successfully", async () => {
    await renderWithProviders(<SignInPage />, {
      contest: MockContestResponseDTO(),
      session: null,
    });

    expect(screen.getByTestId("sign-in-form")).toBeInTheDocument();
    expect(screen.getByTestId("title")).toBeInTheDocument();
    expect(screen.getByTestId("subtitle")).toBeInTheDocument();
    expect(screen.getByTestId("login")).toBeEnabled();
    expect(screen.getByTestId("password")).toBeEnabled();
    expect(screen.getByTestId("sign-in")).toBeEnabled();
    expect(screen.getByTestId("enter-spectator")).toBeEnabled();
  });

  it("hides enter as spectator when it is not allowed", async () => {
    await renderWithProviders(<SignInPage />, {
      contest: MockContestResponseDTO({
        settings: {
          ...MockContestResponseDTO().settings,
          isSpectatorEnabled: false,
        },
      }),
      session: null,
    });

    expect(screen.queryByTestId("enter-spectator")).not.toBeInTheDocument();
  });

  it("shows toast when session has expired", async () => {
    (useSearchParams()[0].get as jest.Mock).mockReturnValue("true");

    await renderWithProviders(<SignInPage />, {
      contest: MockContestResponseDTO(),
      session: null,
    });

    expect(useToast().warning).toHaveBeenCalled();
  });

  it("signs in successfully", async () => {
    const contest = MockContestResponseDTO();
    const session = MockSessionResponseDTO();
    (
      Composition.authenticationWriter.authenticate as jest.Mock
    ).mockResolvedValue(session);

    const { store } = await renderWithProviders(<SignInPage />, {
      contest,
      session: null,
    });

    fillForm();
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });

    expect(Composition.authenticationWriter.authenticate).toHaveBeenCalledWith(
      contest.id,
      {
        login: "testuser",
        password: "password",
      },
    );
    expect(store.getState().session).toEqual(session);
    expect(useNavigate()).toHaveBeenCalledWith(routes.CONTEST(contest.slug));
  });

  it("show toast on failure", async () => {
    (
      Composition.authenticationWriter.authenticate as jest.Mock
    ).mockRejectedValue(new ServerException("server exception"));
    const { store } = await renderWithProviders(<SignInPage />, {
      contest: MockContestResponseDTO(),
      session: null,
    });

    fillForm();
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });

    expect(useToast().error).toHaveBeenCalled();
    expect(store.getState().session).toBeNull();
  });

  it("show error message on unauthorized", async () => {
    (
      Composition.authenticationWriter.authenticate as jest.Mock
    ).mockRejectedValue(new UnauthorizedException("unauthorized"));
    await renderWithProviders(<SignInPage />, {
      contest: MockContestResponseDTO(),
      session: null,
    });

    fillForm();
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign-in"));
    });

    expect(
      screen.getAllByText("Wrong login or password").length,
    ).toBeGreaterThan(0);
  });

  it("enter as spectator successfully", async () => {
    const contest = MockContestResponseDTO();
    const { store } = await renderWithProviders(<SignInPage />, {
      contest,
      session: null,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("enter-spectator"));
    });

    expect(store.getState().session).toBeNull();
    expect(useNavigate()).toHaveBeenCalledWith(routes.CONTEST(contest.slug));
  });

  it("clears session when entering as spectator", async () => {
    const contest = MockContestResponseDTO();
    const { store } = await renderWithProviders(<SignInPage />, {
      contest,
      session: MockSessionResponseDTO(),
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("enter-spectator"));
    });

    expect(store.getState().session).toBeNull();
    expect(useNavigate()).toHaveBeenCalledWith(routes.CONTEST(contest.slug));
  });

  it("ignores exception when entering as spectator", async () => {
    const contest = MockContestResponseDTO();
    const { store } = await renderWithProviders(<SignInPage />, {
      contest,
      session: MockSessionResponseDTO(),
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("enter-spectator"));
    });

    expect(store.getState().session).toBeNull();
    expect(useNavigate()).toHaveBeenCalledWith(routes.CONTEST(contest.slug));
  });
});
