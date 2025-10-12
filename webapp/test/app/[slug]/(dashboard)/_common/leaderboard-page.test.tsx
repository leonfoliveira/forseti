import { screen } from "@testing-library/dom";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard-page";
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
    expect(screen.getByTestId("member-index")).toHaveTextContent("1");
    expect(screen.getByTestId("member-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("member-problem")).toHaveTextContent(
      "01:00:00 +1",
    );
    expect(screen.getByTestId("member-score")).toHaveTextContent("100");
    expect(screen.getByTestId("member-penalty")).toHaveTextContent("00:01:00");
  });
});
