import { render } from "@testing-library/react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import ContestantProblemsPage from "@/app/contests/[slug]/contestant/problems/page";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

jest.mock(
  "@/app/contests/[slug]/contestant/_context/contestant-context",
  () => ({
    useContestantContext: jest.fn(() => ({
      contest: {
        id: "test-contest",
        problems: [{ id: "problem1" }, { id: "problem2" }],
      },
      submissions: [
        { problem: { id: "problem1" }, answer: SubmissionAnswer.ACCEPTED },
        { problem: { id: "problem1" }, answer: SubmissionAnswer.WRONG_ANSWER },
        { problem: { id: "problem2" }, answer: SubmissionAnswer.ACCEPTED },
      ],
    })),
  }),
);

jest.mock("@/app/contests/[slug]/_common/problems-page", () => ({
  ProblemsPage: jest.fn(() => <div>Problems Page</div>),
}));

describe("ContestantProblemsPage", () => {
  it("should render ProblemsPage with correct status", () => {
    render(<ContestantProblemsPage />);

    const defaultAnswerBlock = Object.values(SubmissionAnswer).reduce(
      (acc, answer) => {
        return { ...acc, [answer]: 0 };
      },
      {},
    );

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contest: {
          id: "test-contest",
          problems: [{ id: "problem1" }, { id: "problem2" }],
        },
        contestantStatus: {
          problem1: {
            ...defaultAnswerBlock,
            [SubmissionAnswer.ACCEPTED]: 1,
            [SubmissionAnswer.WRONG_ANSWER]: 1,
          },
          problem2: {
            ...defaultAnswerBlock,
            [SubmissionAnswer.ACCEPTED]: 1,
            [SubmissionAnswer.WRONG_ANSWER]: 0,
          },
        },
      }),
      undefined,
    );
  });
});
