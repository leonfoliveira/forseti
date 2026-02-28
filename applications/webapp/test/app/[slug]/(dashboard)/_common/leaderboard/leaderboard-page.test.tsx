import { screen } from "@testing-library/dom";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LeaderboardPage", () => {
  const problems = [MockProblemResponseDTO()];
  const leaderboard = MockLeaderboardResponseDTO({
    ...MockLeaderboardResponseDTO(),
    rows: [
      { ...MockLeaderboardResponseDTO().rows[0] },
      {
        ...MockLeaderboardResponseDTO().rows[0],
        memberType: MemberType.UNOFFICIAL_CONTESTANT,
      },
    ],
  });

  it("should render common LeaderboardPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const session = MockSession();
    await renderWithProviders(
      <LeaderboardPage problems={problems} leaderboard={leaderboard} />,
      { session, contest },
    );

    expect(document.title).toBe("Forseti - Leaderboard");
    expect(screen.getAllByTestId("member-rank")[0]).toHaveTextContent("1");
    expect(screen.getAllByTestId("member-name")[0]).toHaveTextContent(
      "Test User",
    );
    expect(screen.getAllByTestId("member-score")[0]).toHaveTextContent("100");
    expect(screen.getAllByTestId("member-penalty")[0]).toHaveTextContent("60");
    expect(screen.getAllByTestId("member-problem")[0]).toHaveTextContent(
      "60 (+1)",
    );
    expect(screen.getAllByTestId("member-rank")[1]).toBeEmptyDOMElement();
  });
});
