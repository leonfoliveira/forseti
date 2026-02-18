import { screen } from "@testing-library/dom";

import DashboardLayout from "@/app/[slug]/(dashboard)/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/provider/dashboard-provider", () => ({
  DashboardProvider: jest.fn(({ children }) => children),
}));

describe("DashboardLayout", () => {
  it.each([
    ["Leaderboard", routes.CONTEST_LEADERBOARD],
    ["Problems", routes.CONTEST_PROBLEMS],
    ["Submissions", routes.CONTEST_SUBMISSIONS],
    ["Clarifications", routes.CONTEST_CLARIFICATIONS],
    ["Announcements", routes.CONTEST_ANNOUNCEMENTS],
  ])("should render %s tab and children", async (title, path) => {
    await renderWithProviders(
      <DashboardLayout>
        <span data-testid="child" />
      </DashboardLayout>,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const tab = screen.getByTestId(`tab-${path("test-contest")}`);
    expect(tab).toBeInTheDocument();
    expect(tab).toHaveTextContent(title);

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should render settings tab for admin", async () => {
    await renderWithProviders(
      <DashboardLayout>
        <span data-testid="child" />
      </DashboardLayout>,
      {
        session: MockSession({
          member: { ...MockMemberPublicResponseDTO(), type: MemberType.ADMIN },
        }),
        contestMetadata: MockContestMetadataResponseDTO(),
      },
    );

    const tab = screen.getByTestId(
      `tab-${routes.CONTEST_SETTINGS("test-contest")}`,
    );
    expect(tab).toBeInTheDocument();
    expect(tab).toHaveTextContent("Settings");
  });

  it("should not render settings tab for non-admin users", async () => {
    await renderWithProviders(
      <DashboardLayout>
        <span data-testid="child" />
      </DashboardLayout>,
      {
        session: MockSession({
          member: {
            ...MockMemberPublicResponseDTO(),
            type: MemberType.CONTESTANT,
          },
        }),
        contestMetadata: MockContestMetadataResponseDTO(),
      },
    );

    const settingsTab = screen.queryByTestId(
      `tab-${routes.CONTEST_SETTINGS("test-contest")}`,
    );
    expect(settingsTab).not.toBeInTheDocument();
  });

  it("should render tasks tab for signed in users", async () => {
    await renderWithProviders(
      <DashboardLayout>
        <span data-testid="child" />
      </DashboardLayout>,
      {
        session: MockSession({
          member: {
            ...MockMemberPublicResponseDTO(),
            type: MemberType.CONTESTANT,
          },
        }),
        contestMetadata: MockContestMetadataResponseDTO(),
      },
    );

    const tasksTab = screen.getByTestId(
      `tab-${routes.CONTEST_TICKETS("test-contest")}`,
    );
    expect(tasksTab).toBeInTheDocument();
  });
});
