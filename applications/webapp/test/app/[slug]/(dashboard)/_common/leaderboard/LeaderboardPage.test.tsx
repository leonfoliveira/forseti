import { act, fireEvent, screen } from "@testing-library/react";

import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage";
import { MemberType } from "@/domain/enumerate/MemberType";
import {
  MockLeaderboardResponseDTO,
  MockProblemResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LeaderboardPage", () => {
  it("displays contestants, ranks, scores, and problem cells", async () => {
    const leaderboard = MockLeaderboardResponseDTO();

    await renderWithProviders(
      <LeaderboardPage
        problems={[MockProblemResponseDTO()]}
        leaderboard={leaderboard}
      />,
      { session: MockSessionResponseDTO() },
    );

    expect(screen.getByTestId("leaderboard-table")).toBeInTheDocument();
    expect(screen.getByTestId("member-rank")).toHaveTextContent("1");
    expect(screen.getByTestId("member-name")).toHaveTextContent("Ada Lovelace");
    expect(screen.getByTestId("member-score")).toHaveTextContent("0");
    expect(screen.getByTestId("member-penalty")).toHaveTextContent("0");
    expect(screen.getByTestId("member-problem")).toBeInTheDocument();
  });

  it("highlights the current user's row", async () => {
    const leaderboard = MockLeaderboardResponseDTO();

    await renderWithProviders(
      <LeaderboardPage
        problems={[MockProblemResponseDTO()]}
        leaderboard={leaderboard}
      />,
      {
        session: MockSessionResponseDTO({
          member: {
            id: leaderboard.rows[0].memberId,
            name: "Ada Lovelace",
            type: MemberType.CONTESTANT,
          },
        }),
      },
    );

    const memberRow = screen.getByTestId("leaderboard-member-row");
    expect(memberRow).toHaveClass("font-bold");
  });

  it("filters unofficial contestants", async () => {
    const baseRow = MockLeaderboardResponseDTO().rows[0];
    const leaderboard = MockLeaderboardResponseDTO({
      rows: [
        baseRow,
        {
          ...baseRow,
          memberId: `${baseRow.memberId}-unofficial`,
          memberType: MemberType.UNOFFICIAL_CONTESTANT,
        },
      ],
    });

    await renderWithProviders(
      <LeaderboardPage
        problems={[MockProblemResponseDTO()]}
        leaderboard={leaderboard}
      />,
      {
        session: MockSessionResponseDTO(),
      },
    );

    expect(screen.getAllByTestId("leaderboard-member-row").length).toBe(2);
    expect(screen.getByTestId("does-show-unofficial")).toBeEnabled();

    fireEvent.click(screen.getByTestId("does-show-unofficial"));

    expect(screen.getAllByTestId("leaderboard-member-row").length).toBe(1);
  });
});
