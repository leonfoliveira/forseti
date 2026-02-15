import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { leaderboardWritter } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LeaderboardPage", () => {
  const problems = [MockProblemPublicResponseDTO()];
  const leaderboard = MockLeaderboardResponseDTO();

  it("should render common LeaderboardPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const session = MockSession();
    await renderWithProviders(
      <LeaderboardPage problems={problems} leaderboard={leaderboard} />,
      { session, contestMetadata },
    );

    expect(document.title).toBe("Forseti - Leaderboard");
    expect(screen.getByTestId("member-rank")).toHaveTextContent("1");
    expect(screen.getByTestId("member-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("member-score")).toHaveTextContent("100");
    expect(screen.getByTestId("member-penalty")).toHaveTextContent("60");
    expect(screen.getByTestId("member-problem")).toHaveTextContent("60 (+1)");
  });

  it("should display freeze toggle button when user has edit permissions", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const session = MockSession();
    await renderWithProviders(
      <LeaderboardPage problems={problems} leaderboard={leaderboard} canEdit />,
      { session, contestMetadata },
    );

    expect(screen.getByTestId("freeze-toggle-button")).toBeInTheDocument();
  });

  it("should handle contest freeze successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const session = MockSession();
    await renderWithProviders(
      <LeaderboardPage problems={problems} leaderboard={leaderboard} canEdit />,
      { session, contestMetadata },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.freeze).toHaveBeenCalledWith(contestMetadata.id);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle contest freeze failure", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const session = MockSession();
    const error = new Error("Freeze failed");
    (leaderboardWritter.freeze as jest.Mock).mockRejectedValueOnce(error);

    await renderWithProviders(
      <LeaderboardPage problems={problems} leaderboard={leaderboard} canEdit />,
      { session, contestMetadata },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.freeze).toHaveBeenCalledWith(contestMetadata.id);
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle contest unfreeze successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const session = MockSession();
    const frozenLeaderboard = MockLeaderboardResponseDTO({ isFrozen: true });
    await renderWithProviders(
      <LeaderboardPage
        problems={problems}
        leaderboard={frozenLeaderboard}
        canEdit
      />,
      { session, contestMetadata },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.unfreeze).toHaveBeenCalledWith(
      contestMetadata.id,
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle contest unfreeze failure", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const session = MockSession();
    const frozenLeaderboard = MockLeaderboardResponseDTO({ isFrozen: true });
    const error = new Error("Unfreeze failed");
    (leaderboardWritter.unfreeze as jest.Mock).mockRejectedValueOnce(error);

    await renderWithProviders(
      <LeaderboardPage
        problems={problems}
        leaderboard={frozenLeaderboard}
        canEdit
      />,
      { session, contestMetadata },
    );

    fireEvent.click(screen.getByTestId("freeze-toggle-button"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(leaderboardWritter.unfreeze).toHaveBeenCalledWith(
      contestMetadata.id,
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
