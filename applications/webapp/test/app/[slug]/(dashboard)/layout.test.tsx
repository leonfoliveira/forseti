import { screen } from "@testing-library/dom";

import DashboardLayout from "@/app/[slug]/(dashboard)/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";
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
      { contest: MockContestResponseDTO() },
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
          member: { ...MockMemberResponseDTO(), type: MemberType.ADMIN },
        }),
        contest: MockContestResponseDTO(),
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
            ...MockMemberResponseDTO(),
            type: MemberType.CONTESTANT,
          },
        }),
        contest: MockContestResponseDTO(),
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
            ...MockMemberResponseDTO(),
            type: MemberType.CONTESTANT,
          },
        }),
        contest: MockContestResponseDTO(),
      },
    );

    const tasksTab = screen.getByTestId(
      `tab-${routes.CONTEST_TICKETS("test-contest")}`,
    );
    expect(tasksTab).toBeInTheDocument();
  });
});
