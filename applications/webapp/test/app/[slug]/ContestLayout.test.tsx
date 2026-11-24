import { act, render, screen } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";

import { ContestLayout } from "@/app/[slug]/ContestLayout";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";

jest.mock("@/app/_lib/component/layout/Footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));
jest.mock("@/app/_lib/component/layout/Header", () => ({
  Header: () => <header data-testid="header" />,
}));
jest.mock("@/app/_lib/component/page/LoadingPage", () => ({
  LoadingPage: () => <p data-testid="loading" />,
}));
jest.mock("@/app/_lib/component/page/ErrorPage", () => ({
  ErrorPage: () => <p data-testid="error" />,
}));
jest.mock("@/app/_lib/store/StoreProvider", () => ({
  StoreProvider: ({
    children,
    preloadedState,
  }: {
    children: React.ReactNode;
    preloadedState: unknown;
  }) => (
    <div data-testid="store" data-loaded={JSON.stringify(preloadedState)}>
      {children}
    </div>
  ),
}));

describe("ContestLayout", () => {
  it("fetches data on startup", async () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "/spring/leaderboard",
    });

    await act(async () => render(<ContestLayout />));

    expect(Composition.sessionReader.getCurrent).toHaveBeenCalled();
    expect(Composition.contestReader.findBySlug).toHaveBeenCalledWith("spring");
  });

  it("renders error page on failure", async () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "/spring/leaderboard",
    });
    (Composition.sessionReader.getCurrent as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch session"),
    );

    await act(async () => render(<ContestLayout />));

    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("navigates to sign-in page on unauthorized", async () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "/spring/leaderboard",
    });
    (Composition.sessionReader.getCurrent as jest.Mock).mockRejectedValueOnce(
      new UnauthorizedException("Unauthorized"),
    );

    await act(async () => render(<ContestLayout />));

    expect(useNavigate()).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN("spring"),
      { replace: true },
    );
  });

  it("does not navigates to sign-in page if already on sign-in page", async () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "/spring/sign-in",
    });
    (Composition.sessionReader.getCurrent as jest.Mock).mockRejectedValueOnce(
      new UnauthorizedException("Unauthorized"),
    );

    await act(async () => render(<ContestLayout />));

    expect(useNavigate()).not.toHaveBeenCalled();
  });

  it("navigates to not found page on not found", async () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "/spring/leaderboard",
    });
    (Composition.sessionReader.getCurrent as jest.Mock).mockRejectedValueOnce(
      new NotFoundException("Not Found"),
    );

    await act(async () => render(<ContestLayout />));

    expect(useNavigate()).toHaveBeenCalledWith(routes.NOT_FOUND, {
      replace: true,
    });
  });
});
