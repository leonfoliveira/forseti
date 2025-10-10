import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/admin-settings-page";
import { contestService, leaderboardService } from "@/config/composition";
import { useToast } from "@/lib/util/toast-hook";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

jest.mock("@/app/[slug]/(dashboard)/settings/_tab/contest-settings", () => ({
  ContestSettings: (props: any) =>
    props.isOpen && <span data-testid="contest-settings-tab" />,
}));
jest.mock("@/app/[slug]/(dashboard)/settings/_tab/members-settings", () => ({
  MembersSettings: (props: any) =>
    props.isOpen && <span data-testid="members-settings-tab" />,
}));
jest.mock("@/app/[slug]/(dashboard)/settings/_tab/problems-settings", () => ({
  ProblemsSettings: (props: any) =>
    props.isOpen && <span data-testid="problems-settings-tab" />,
}));

describe("AdminSettingsPage", () => {
  it("should render base content", async () => {
    await renderWithProviders(<AdminSettingsPage />, {
      contestMetadata: MockContestMetadataResponseDTO({
        startAt: new Date(Date.now() + 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      }),
      adminDashboard: { contest: MockContestFullResponseDTO() },
    } as any);

    expect(document.title).toBe("Judge - Settings");
    const tabs = screen.getAllByTestId("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent("Contest");
    expect(tabs[1]).toHaveTextContent("Problems");
    expect(tabs[2]).toHaveTextContent("Members");

    expect(screen.getByTestId("contest-settings-tab")).toBeInTheDocument();
    expect(
      screen.queryByTestId("problems-settings-tab"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("members-settings-tab"),
    ).not.toBeInTheDocument();

    expect(screen.getByTestId("reset")).toBeEnabled();
    expect(screen.getByTestId("save")).toBeEnabled();
  });

  it("should render settings tab content when tab is clicked", async () => {
    await renderWithProviders(<AdminSettingsPage />, {
      contestMetadata: MockContestMetadataResponseDTO(),
      adminDashboard: { contest: MockContestFullResponseDTO() },
    } as any);

    const tabs = screen.getAllByTestId("tab");
    fireEvent.click(tabs[0]);
    expect(screen.getByTestId("contest-settings-tab")).toBeInTheDocument();

    fireEvent.click(tabs[1]);
    expect(screen.getByTestId("problems-settings-tab")).toBeInTheDocument();

    fireEvent.click(tabs[2]);
    expect(screen.getByTestId("members-settings-tab")).toBeInTheDocument();
  });

  it("should disable save button when contest has ended", async () => {
    await renderWithProviders(<AdminSettingsPage />, {
      contestMetadata: MockContestMetadataResponseDTO({
        startAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() - 60 * 1000).toISOString(),
      }),
      adminDashboard: { contest: MockContestFullResponseDTO() },
    } as any);

    expect(screen.getByTestId("save")).toBeDisabled();
  });

  it("should show alert when contest is running", async () => {
    await renderWithProviders(<AdminSettingsPage />, {
      contestMetadata: MockContestMetadataResponseDTO({
        startAt: new Date(Date.now() - 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 60 * 1000).toISOString(),
      }),
      adminDashboard: { contest: MockContestFullResponseDTO() },
    } as any);

    await act(async () => {
      fireEvent.click(screen.getByTestId("save"));
    });
    expect(screen.getByTestId("in-progress-alert")).toBeInTheDocument();
  });

  it("should handle save success", async () => {
    const newContest = MockContestFullResponseDTO();
    (contestService.updateContest as jest.Mock).mockResolvedValue(newContest);
    const newLeaderboard = MockLeaderboardResponseDTO();
    (leaderboardService.findContestLeaderboard as jest.Mock).mockResolvedValue(
      newLeaderboard,
    );
    const { store } = await renderWithProviders(<AdminSettingsPage />, {
      contestMetadata: MockContestMetadataResponseDTO({
        startAt: new Date(Date.now() - 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 60 * 1000).toISOString(),
      }),
      adminDashboard: { contest: MockContestFullResponseDTO() },
    } as any);

    await act(async () => {
      fireEvent.click(screen.getByTestId("save"));
    });
    const saveConfirmationModal = screen.getByTestId("save-confirmation-modal");
    expect(saveConfirmationModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(saveConfirmationModal.getByTestId("confirm") as any);
    });
    expect(saveConfirmationModal).toBeInTheDocument();
    expect(contestService.updateContest).toHaveBeenCalled();
    expect(store.getState().adminDashboard.contest).toBe(newContest);
    expect(store.getState().adminDashboard.leaderboard).toBe(newLeaderboard);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle save failure", async () => {
    (contestService.updateContest as jest.Mock).mockRejectedValue(new Error());
    await renderWithProviders(<AdminSettingsPage />, {
      contestMetadata: MockContestMetadataResponseDTO({
        startAt: new Date(Date.now() - 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 60 * 1000).toISOString(),
      }),
      adminDashboard: { contest: MockContestFullResponseDTO() },
    } as any);

    await act(async () => {
      fireEvent.click(screen.getByTestId("save"));
    });
    const saveConfirmationModal = screen.getByTestId("save-confirmation-modal");
    expect(saveConfirmationModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(saveConfirmationModal.getByTestId("confirm") as any);
    });
    expect(saveConfirmationModal).toBeInTheDocument();
    expect(contestService.updateContest).toHaveBeenCalled();
    expect(useToast().error).toHaveBeenCalled();
  });
});
