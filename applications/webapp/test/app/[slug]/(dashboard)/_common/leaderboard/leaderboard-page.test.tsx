import { screen } from "@testing-library/dom";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LeaderboardPage", () => {
  const problems = [MockProblemResponseDTO()];
  const leaderboard = MockLeaderboardResponseDTO();

  it("should render common LeaderboardPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const session = MockSession();
    await renderWithProviders(
      <LeaderboardPage problems={problems} leaderboard={leaderboard} />,
      { session, contest },
    );

    expect(document.title).toBe("Forseti - Leaderboard");
    expect(screen.getByTestId("member-rank")).toHaveTextContent("1");
    expect(screen.getByTestId("member-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("member-score")).toHaveTextContent("100");
    expect(screen.getByTestId("member-penalty")).toHaveTextContent("60");
    expect(screen.getByTestId("member-problem")).toHaveTextContent("60 (+1)");
  });
});
