import { render, screen } from "@testing-library/react";

import { ContestDashboardLayout } from "@/app/contests/[slug]/_component/contest-dashboard-layout";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestUtil } from "@/core/util/contest-util";

jest.mock("@/core/util/contest-util");
jest.mock("@/app/contests/[slug]/_common/wait-page", () => ({
  WaitPage: ({ contestMetadata }: any) => (
    <div data-testid="wait-page">{contestMetadata.id}</div>
  ),
}));
jest.mock("@/app/_component/navbar", () => ({
  Navbar: ({ contestMetadata, signInPath }: any) => (
    <div>
      <span data-testid="contest-id">{contestMetadata.id}</span>
      <a href={signInPath} data-testid="sign-in"></a>
    </div>
  ),
}));
jest.mock("@/app/contests/[slug]/_component/contest-tab-bar", () => ({
  ContestTabBar: ({ tabs }: any) => (
    <>
      <span data-testid="tab-label">{tabs[0].label}</span>
      <span data-testid="tab-path">{tabs[0].path}</span>
    </>
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
      { label: "Overview", path: "/contests/contest-slug/overview" },
    ];

    render(
      <ContestDashboardLayout contestMetadata={contestMetadata} tabs={tabs}>
        <span data-testid="child" />
      </ContestDashboardLayout>,
    );

    expect(screen.getByTestId("contest-id")).toHaveTextContent("contest-123");
    expect(screen.getByTestId("sign-in")).toHaveAttribute(
      "href",
      routes.CONTEST_SIGN_IN(contestMetadata.slug, true),
    );
    expect(screen.getByTestId("tab-label")).toHaveTextContent("Overview");
    expect(screen.getByTestId("tab-path")).toHaveTextContent(
      "/contests/contest-slug/overview",
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
