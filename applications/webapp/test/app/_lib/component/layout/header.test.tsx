import { fireEvent, screen } from "@testing-library/dom";
import { usePathname, useRouter } from "next/navigation";

import { Header } from "@/app/_lib/component/layout/header";
import { useTheme } from "@/app/_lib/hook/theme-hook";
import { sessionWritter } from "@/config/composition";
import { routes } from "@/config/routes";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/hook/theme-hook", () => ({
  ...jest.requireActual("@/app/_lib/hook/theme-hook"),
  useTheme: jest.fn(() => ({ theme: "light", toggleTheme: jest.fn() })),
}));

describe("Header", () => {
  const session = MockSession();
  const contestMetadata = MockContestMetadataResponseDTO();

  it("should render brand correctly", async () => {
    await renderWithProviders(<Header />, { session, contestMetadata });

    expect(screen.getByTestId("title")).toHaveTextContent(
      contestMetadata.title,
    );
    expect(screen.getByTestId("status")).toBeInTheDocument();
  });

  it("should render countdown when contest has not started", async () => {
    await renderWithProviders(<Header />, {
      session,
      contestMetadata: {
        ...contestMetadata,
        startAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
        endAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      },
    });

    expect(screen.getByTestId("countdown-clock")).toBeInTheDocument();
  });

  it("should render countdown when contest has started", async () => {
    await renderWithProviders(<Header />, {
      session,
      contestMetadata: {
        ...contestMetadata,
        startAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        endAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      },
    });

    expect(screen.getByTestId("countdown-clock")).toBeInTheDocument();
  });

  it("should not render countdown when contest has ended", async () => {
    await renderWithProviders(<Header />, {
      session,
      contestMetadata: {
        ...contestMetadata,
        startAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        endAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    });

    expect(screen.queryByTestId("countdown-clock")).not.toBeInTheDocument();
  });

  it("should render theme button correctly", async () => {
    const toggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: "dark", toggleTheme });
    await renderWithProviders(<Header />, {
      session,
      contestMetadata,
    });

    const button = screen.getAllByTestId("theme-toggle")[0];
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(toggleTheme).toHaveBeenCalled();
  });

  it("should not render member information if not authorized", async () => {
    await renderWithProviders(<Header />, {
      session: null,
      contestMetadata,
    });

    expect(screen.queryByTestId("member-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("member-type")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sign-out")).not.toBeInTheDocument();
  });

  it("should render member information correctly", async () => {
    await renderWithProviders(<Header />, {
      session,
      contestMetadata,
    });

    expect(screen.getAllByTestId("member-name")[0]).toHaveTextContent(
      session.member.name,
    );
    expect(screen.getAllByTestId("member-type")[0]).not.toBeEmptyDOMElement();
    expect(screen.getAllByTestId("sign-out")[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId("sign-out")[0]);
    expect(sessionWritter.deleteCurrent).toHaveBeenCalled();
  });

  it("should not render sign-in button if pathname is sign in page", async () => {
    (usePathname as jest.Mock).mockReturnValue(
      routes.CONTEST_SIGN_IN(contestMetadata.slug),
    );
    await renderWithProviders(<Header />, {
      session: null,
      contestMetadata,
    });

    expect(screen.queryByTestId("sign-in")).not.toBeInTheDocument();
  });

  it("should render sign-in button correctly", async () => {
    (usePathname as jest.Mock).mockReturnValue(
      routes.CONTEST(contestMetadata.slug),
    );
    await renderWithProviders(<Header />, {
      session: null,
      contestMetadata,
    });

    const button = screen.getAllByTestId("sign-in")[0];
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(useRouter().push).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN(contestMetadata.slug),
    );
  });
});
