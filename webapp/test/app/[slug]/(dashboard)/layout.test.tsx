import { fireEvent, screen } from "@testing-library/dom";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/app/[slug]/(dashboard)/layout";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/lib/provider/dashboard-provider", () => ({
  DashboardProvider: jest.fn(({ children }) => children),
}));

describe("DashboardLayout", () => {
  it.each([
    ["Leaderboard", routes.CONTEST_LEADERBOARD],
    ["Problems", routes.CONTEST_PROBLEMS],
    ["Submissions", routes.CONTEST_SUBMISSIONS],
    ["Clarifications", routes.CONTEST_CLARIFICATIONS],
    ["Announcements", routes.CONTEST_ANNOUNCEMENTS],
  ])("should render tab and children", async (title, path) => {
    await renderWithProviders(
      <DashboardLayout>
        <span data-testid="child" />
      </DashboardLayout>,
      { contestMetadata: MockContestMetadataResponseDTO() },
    );

    const tab = screen.getByText(title);
    expect(tab).toBeInTheDocument();
    fireEvent.click(tab);
    expect(useRouter().push).toHaveBeenCalledWith(path("test-contest"));

    expect(screen.getByTestId("child"));
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

    const tab = screen.getByText("Settings");
    expect(tab).toBeInTheDocument();
    fireEvent.click(tab);
    expect(useRouter().push).toHaveBeenCalledWith(
      routes.CONTEST_SETTINGS("test-contest"),
    );
  });
});
