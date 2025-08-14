import { render, screen, fireEvent } from "@testing-library/react";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_common/contest-dashboard-layout";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestUtil } from "@/core/util/contest-util";
import { mockRouter, mockUsePathname } from "@/test/jest.setup";

jest.mock("@/core/util/contest-util");
jest.mock("@/app/contests/[slug]/_common/wait-page", () => ({
  WaitPage: ({ contestMetadata }: any) => (
    <div data-testid="wait-page">{contestMetadata.id}</div>
  ),
}));
jest.mock("@/lib/component/navbar", () => ({
  Navbar: ({ contestMetadata, signInPath }: any) => (
    <div>
      <span data-testid="contest-id">{contestMetadata.id}</span>
      <a href={signInPath} data-testid="sign-in"></a>
    </div>
  ),
}));

describe("ContestDashboardLayout", () => {
  it("should render WaitPage when contest is not started", () => {
    (ContestUtil.getStatus as jest.Mock).mockReturnValue(
      ContestStatus.NOT_STARTED,
    );

    render(
      <ContestDashboardLayout contestMetadata={{} as any} tabs={[]}>
        <span data-testid="child" />
      </ContestDashboardLayout>,
    );

    expect(screen.getByTestId("wait-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should render Navbar and ContestTabBar when contest is started", () => {
    (ContestUtil.getStatus as jest.Mock).mockReturnValue(
      ContestStatus.IN_PROGRESS,
    );

    const contestMetadata = {
      id: "contest-123",
      slug: "contest-slug",
    } as unknown as ContestMetadataResponseDTO;
    const tabs = [
      {
        label: { id: "overview", defaultMessage: "Overview" },
        path: "/contests/contest-slug/overview",
      },
    ];

    render(
      <ContestDashboardLayout contestMetadata={contestMetadata} tabs={tabs}>
        <span data-testid="child" />
      </ContestDashboardLayout>,
    );

    expect(screen.getByTestId("contest-id")).toHaveTextContent("contest-123");
    expect(screen.getByTestId("sign-in")).toHaveAttribute(
      "href",
      routes.CONTEST_SIGN_IN(contestMetadata.slug),
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should render tabs with correct labels and paths", () => {
    mockUsePathname.mockReturnValueOnce("/contests/contest-slug/overview");

    const contestMetadata = {
      id: "contest-123",
      slug: "contest-slug",
    } as unknown as ContestMetadataResponseDTO;
    const tabs = [
      {
        label: { id: "tab-1", defaultMessage: "Overview" },
        path: "/contests/contest-slug/overview",
      },
      {
        label: { id: "tab-2", defaultMessage: "Problems" },
        path: "/contests/contest-slug/problems",
      },
    ];

    render(
      <ContestDashboardLayout contestMetadata={contestMetadata} tabs={tabs}>
        <span data-testid="child" />
      </ContestDashboardLayout>,
    );

    const tabElements = screen.getAllByTestId("tab");

    expect(tabElements[0]).toHaveClass("tab-active");
    expect(tabElements[0]).toHaveTextContent("Overview");
    fireEvent.click(tabElements[0]);
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/contests/contest-slug/overview",
    );

    expect(tabElements[1]).not.toHaveClass("tab-active");
    expect(tabElements[1]).toHaveTextContent("Problems");
    fireEvent.click(tabElements[1]);
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/contests/contest-slug/problems",
    );
  });
});
