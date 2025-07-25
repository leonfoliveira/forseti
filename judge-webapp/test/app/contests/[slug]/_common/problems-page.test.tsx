import { render, screen } from "@testing-library/react";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

jest.mock("@/app/_component/form/download-button", () => ({
  DownloadButton: ({ attachment }: any) => attachment.id,
}));

jest.mock(
  "@/app/contests/[slug]/_component/badge/submission-answer-short-badge",
  () => ({
    SubmissionAnswerShortBadge: ({ answer, amount }: any) => (
      <span data-testid="badge">{`${answer},${amount}`}</span>
    ),
  }),
);

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

    render(<ProblemsPage contest={contest} />);

    expect(screen.getAllByTestId("problem-row")).toHaveLength(2);
    expect(screen.getAllByTestId("problem-title")[0]).toHaveTextContent(
      "problem-title",
    );
    expect(screen.getAllByTestId("download")[0]).toHaveTextContent("at-1");
    expect(screen.getAllByTestId("problem-title")[1]).toHaveTextContent(
      "problem-title",
    );
    expect(screen.getAllByTestId("download")[1]).toHaveTextContent("at-2");
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
      <ProblemsPage contest={contest} contestantStatus={contestantStatus} />,
    );

    const badges = screen.getAllByTestId("badge");
    expect(badges).toHaveLength(3);
    expect(badges[0]).toHaveTextContent(`ACCEPTED,1`);
    expect(badges[1]).toHaveTextContent(`WRONG_ANSWER,2`);
    expect(badges[2]).toHaveTextContent(`WRONG_ANSWER,1`);
  });
});
