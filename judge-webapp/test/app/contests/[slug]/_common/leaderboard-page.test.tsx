import { mockUseAuthorizationContext } from "@/test/jest.setup";
import { render, screen } from "@testing-library/react";
import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

describe("LeaderboardPage", () => {
  it("should render the leaderboard with correct data", () => {
    mockUseAuthorizationContext.mockResolvedValueOnce({
      authorization: { member: { id: "1" } },
    });
    const contest = {
      problems: [
        { id: "1", letter: "A" },
        { id: "2", letter: "B" },
      ],
    } as unknown as ContestPublicResponseDTO;
    const leaderboard = {
      contestId: "contest-1",
      slug: "contest-1",
      startAt: "2023-10-01T00:00:00Z",
      issuedAt: "2023-10-01T01:00:00Z",
      classification: [
        {
          memberId: "1",
          name: "Test User",
          score: 100,
          penalty: 10,
          problems: [
            {
              problemId: "1",
              letter: "A",
              isAccepted: true,
              acceptedAt: "2023-10-01T00:30:00Z",
              wrongSubmissions: 2,
              penalty: 5,
            },
            {
              problemId: "2",
              letter: "B",
              isAccepted: false,
              wrongSubmissions: 1,
              penalty: 3,
            },
          ],
        },
        {
          memberId: "2",
          name: "Another User",
          score: 0,
          penalty: 0,
          problems: [
            {
              problemId: "1",
              letter: "A",
              isAccepted: true,
              acceptedAt: "2023-10-01T00:45:00Z",
              wrongSubmissions: 1,
              penalty: 4,
            },
            {
              problemId: "2",
              letter: "B",
              isAccepted: true,
              acceptedAt: "2023-10-01T00:50:00Z",
              wrongSubmissions: 0,
              penalty: 2,
            },
          ],
        },
      ],
    } as ContestLeaderboardResponseDTO;

    render(<LeaderboardPage contest={contest} leaderboard={leaderboard} />);

    expect(screen.getAllByTestId("problem-title")[0]).toHaveTextContent(
      contest.problems[0].letter,
    );
    expect(screen.getAllByTestId("problem-title")[1]).toHaveTextContent(
      contest.problems[1].letter,
    );
    expect(screen.getAllByTestId("header-score")[0]).toHaveTextContent("Score");
    expect(screen.getAllByTestId("header-penalty")[0]).toHaveTextContent(
      "Penalty",
    );
    expect(screen.getAllByTestId("member-row")).toHaveLength(2);
    expect(screen.getAllByTestId("member-name")[0]).toHaveTextContent(
      `1. ${leaderboard.classification[0].name}`,
    );
    expect(screen.getAllByTestId("member-name")[1]).toHaveTextContent(
      `2. ${leaderboard.classification[1].name}`,
    );
    expect(screen.getAllByTestId("member-problem")[0]).toHaveTextContent(
      "2023-10-01T00:30:00Z | +2",
    );
    expect(screen.getAllByTestId("member-problem")[1]).toHaveTextContent("+1");
    expect(screen.getAllByTestId("member-problem")[2]).toHaveTextContent(
      "2023-10-01T00:45:00Z | +1",
    );
    expect(screen.getAllByTestId("member-problem")[3]).toHaveTextContent(
      "2023-10-01T00:50:00Z",
    );
    expect(screen.getAllByTestId("member-score")[0]).toHaveTextContent("100");
    expect(screen.getAllByTestId("member-score")[1]).toHaveTextContent("");
    expect(screen.getAllByTestId("member-penalty")[0]).toHaveTextContent("10");
    expect(screen.getAllByTestId("member-penalty")[1]).toHaveTextContent("");
  });
});
