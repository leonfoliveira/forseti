import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { Header } from "@/lib/component/header";
import { useTheme } from "@/lib/util/theme-hook";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";
import { authorizationService } from "@/config/composition";

jest.mock("@/lib/util/theme-hook", () => ({
  ...jest.requireActual("@/lib/util/theme-hook"),
  useTheme: jest.fn(() => ({ theme: "light", toggleTheme: jest.fn() })),
}));

describe("Header", () => {
  const authorization = MockAuthorization();
  const contestMetadata = MockContestMetadataResponseDTO();

  it("should render brand correctly", async () => {
    await renderWithProviders(<Header />, { authorization, contestMetadata });

    expect(screen.getByTestId("title")).toHaveTextContent(
      contestMetadata.title,
    );
    expect(screen.getByTestId("status")).toBeInTheDocument();
  });

  it("should render countdown when contest has started", async () => {
    await renderWithProviders(<Header />, {
      authorization,
      contestMetadata: {
        ...contestMetadata,
        startAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        endAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      },
    });

    expect(screen.getByTestId("countdown-clock")).toBeInTheDocument();
  });

  it("should not render countdown when contest has not started", async () => {
    await renderWithProviders(<Header />, {
      authorization,
      contestMetadata: {
        ...contestMetadata,
        startAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        endAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
      },
    });

    expect(screen.queryByTestId("countdown-clock")).not.toBeInTheDocument();
  });

  it("should render switch correctly for dark theme", async () => {
    const toggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: "dark", toggleTheme });
    await renderWithProviders(<Header />, {
      authorization,
      contestMetadata,
    });

    expect(
      screen.getByTestId("theme-switch").querySelector("input"),
    ).toBeChecked();
    expect(screen.queryByTestId("moon-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
  });

  it("should render switch correctly for light theme", async () => {
    const toggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: "light", toggleTheme });
    await renderWithProviders(<Header />, {
      authorization,
      contestMetadata,
    });

    expect(
      screen.getByTestId("theme-switch").querySelector("input"),
    ).not.toBeChecked();
    expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sun-icon")).toBeInTheDocument();
  });

  it("should not render dropdown if not authorized", async () => {
    await renderWithProviders(<Header />, {
      authorization: null,
      contestMetadata,
    });

    expect(screen.queryByTestId("user-dropdown")).not.toBeInTheDocument();
  });

  it("should render dropdown correctly", async () => {
    await renderWithProviders(<Header />, {
      authorization,
      contestMetadata,
    });

    const trigger = screen.getByTestId("user-dropdown-trigger");
    expect(trigger).toHaveTextContent(authorization.member.name);
    await act(async () => fireEvent.click(trigger));
    expect(screen.getByTestId("member-type")).toHaveTextContent("Contestant");
    await act(async () => fireEvent.click(screen.getByTestId("sign-out")));
    expect(authorizationService.cleanAuthorization).toHaveBeenCalled();
  });

  it("should not render sign-in button if user is authorized", async () => {
    await renderWithProviders(<Header />, {
      authorization,
      contestMetadata,
    });

    expect(screen.queryByTestId("sign-in")).not.toBeInTheDocument();
  });

  it("should not render sign-in button if pathname is sign in page", async () => {
    (usePathname as jest.Mock).mockReturnValue(
      routes.CONTEST_SIGN_IN(contestMetadata.slug),
    );
    await renderWithProviders(<Header />, {
      authorization: null,
      contestMetadata,
    });

    expect(screen.queryByTestId("sign-in")).not.toBeInTheDocument();
  });

  it("should render sign-in button correctly", async () => {
    (usePathname as jest.Mock).mockReturnValue(
      routes.CONTEST(contestMetadata.slug),
    );
    await renderWithProviders(<Header />, {
      authorization: null,
      contestMetadata,
    });

    const button = screen.getByTestId("sign-in");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(useRouter().push).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN(contestMetadata.slug),
    );
  });
});
