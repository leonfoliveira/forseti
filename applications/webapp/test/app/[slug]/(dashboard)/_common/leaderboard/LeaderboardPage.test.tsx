import { render, screen } from "@testing-library/react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";
import { MockLeaderboardResponseDTO, MockProblemResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LeaderboardPage", () => {
  it("displays contestants, ranks, scores, and problem cells", async () => {
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(
      <LeaderboardPage problems={[MockProblemResponseDTO()]} leaderboard={leaderboard} />,
      { session: MockSessionResponseDTO() },
    );
    expect(screen.getByTestId("leaderboard-table")).toBeInTheDocument();
    expect(screen.getByTestId("member-name")).toHaveTextContent("Ada Lovelace");
    expect(screen.getByTestId("member-score")).toHaveTextContent("0");
  });
});
