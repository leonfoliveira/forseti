import { fireEvent, screen } from "@testing-library/dom";

import { LeaderboardPageRevealer } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page-revealer";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LeaderboardPageRevealer", () => {
  const contest = MockContestResponseDTO();
  const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
  const leaderboard = MockLeaderboardResponseDTO({
    rows: [
      MockLeaderboardResponseDTO().rows[0],
      MockLeaderboardResponseDTO().rows[0],
    ],
  });

  it("show toast when leaderboard fails to load", async () => {
    (Composition.leaderboardReader.get as jest.Mock).mockRejectedValue(
      new Error("Failed to load"),
    );

    await renderWithProviders(
      <LeaderboardPageRevealer problems={problems} onClose={() => {}} />,
      { contest },
    );

    expect(useToast().error).toHaveBeenCalled();
  });

  it("should render leaderboard with all cells hidden initially and reveal them on key press", async () => {
    (Composition.leaderboardReader.get as jest.Mock).mockResolvedValue(
      leaderboard,
    );

    await renderWithProviders(
      <LeaderboardPageRevealer problems={problems} onClose={() => {}} />,
      { contest },
    );

    const rows = screen.getAllByTestId("row");
    rows.forEach((row, index) => {
      expect(row.getByTestId("cell-rank")).toHaveTextContent(`${index + 1}`);
      expect(row.getByTestId("cell-name")).toHaveTextContent("Test User");
      expect(row.getByTestId("cell-score")).toHaveTextContent("100");
      expect(row.getByTestId("cell-penalty")).toHaveTextContent("60");
    });

    expect(rows[0]).not.toHaveClass("is-revealed");
    expect(rows[1]).not.toHaveClass("is-revealed");

    fireEvent.keyDown(window, { key: "ArrowUp" });

    expect(rows[0]).not.toHaveClass("is-revealed");
    expect(rows[1]).toHaveClass("is-revealed");

    fireEvent.keyDown(window, { key: "ArrowUp" });

    expect(rows[0]).toHaveClass("is-revealed");
    expect(rows[1]).toHaveClass("is-revealed");

    fireEvent.keyDown(window, { key: "ArrowDown" });

    expect(rows[0]).not.toHaveClass("is-revealed");
    expect(rows[1]).toHaveClass("is-revealed");
  });
});
