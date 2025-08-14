import { render, screen } from "@testing-library/react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";

describe("ProblemsPage", () => {
  it("should render the problems with correct data", () => {
    const contest = {
      problems: [
        {
          id: "1",
          letter: "A",
          title: "Problem A",
          description: { id: "at-1" },
        },
        {
          id: "2",
          letter: "B",
          title: "Problem B",
          description: { id: "at-2" },
        },
      ],
    } as unknown as ContestPublicResponseDTO;

    render(<ProblemsPage problems={contest.problems} />);

    expect(screen.getAllByTestId("problem-row")).toHaveLength(2);
    expect(screen.getAllByTestId("problem-title")[0]).toHaveTextContent(
      "{letter}. {title}",
    );
    expect(screen.getAllByTestId("problem-title")[1]).toHaveTextContent(
      "{letter}. {title}",
    );
  });

  it("should render problems with contestant status", () => {
    const contest = {
      problems: [
        {
          id: "1",
          letter: "A",
          title: "Problem A",
          description: { id: "at-1" },
        },
        {
          id: "2",
          letter: "B",
          title: "Problem B",
          description: { id: "at-2" },
        },
      ],
    } as unknown as ContestPublicResponseDTO;

    const contestantStatus = {
      "1": {
        [SubmissionAnswer.ACCEPTED]: 1,
        [SubmissionAnswer.WRONG_ANSWER]: 2,
      },
      "2": {
        [SubmissionAnswer.ACCEPTED]: 0,
        [SubmissionAnswer.WRONG_ANSWER]: 1,
      },
    } as any;

    render(
      <ProblemsPage
        problems={contest.problems}
        contestantStatus={contestantStatus}
      />,
    );

    const badges = screen.getAllByTestId("badge");
    expect(badges).toHaveLength(3);
    expect(badges[0]).toHaveTextContent(`{answer} x{amount}`);
  });
});
