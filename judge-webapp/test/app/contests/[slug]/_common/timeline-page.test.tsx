import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { render, screen } from "@testing-library/react";
import { mockUseAuthorizationContext } from "@/test/jest.setup";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: () => ({
    formatLanguage: (lang: string) => lang,
  }),
}));

jest.mock("@/app/_component/timestamp-display", () => ({
  TimestampDisplay: ({ timestamp }: any) => timestamp,
}));

jest.mock(
  "@/app/contests/[slug]/_component/badge/submission-answer-badge",
  () => ({
    SubmissionAnswerBadge: ({ answer }: any) => answer,
  }),
);

describe("TimelinePage", () => {
  it("should render the timeline with correct data", () => {
    mockUseAuthorizationContext.mockResolvedValueOnce({
      authorization: { member: { id: "1" } },
    });
    const submissions = [
      {
        id: "1",
        language: Language.PYTHON_3_13_3,
        answer: SubmissionAnswer.ACCEPTED,
        createdAt: "2023-10-01T00:30:00Z",
        member: { id: "1", name: "Test User" },
        problem: { id: "1", letter: "A" },
      },
      {
        id: "2",
        language: Language.PYTHON_3_13_3,
        answer: SubmissionAnswer.ACCEPTED,
        createdAt: "2023-10-01T00:30:00Z",
        member: { id: "2", name: "Test User" },
        problem: { id: "1", letter: "A" },
      },
    ] as unknown as SubmissionPublicResponseDTO[];

    render(<TimelinePage submissions={submissions} />);

    expect(screen.getByTestId("header-timestamp")).toHaveTextContent(
      "header-timestamp",
    );
    expect(screen.getByTestId("header-contestant")).toHaveTextContent(
      "header-contestant",
    );
    expect(screen.getByTestId("header-problem")).toHaveTextContent(
      "header-problem",
    );
    expect(screen.getByTestId("header-language")).toHaveTextContent(
      "header-language",
    );
    expect(screen.getByTestId("header-answer")).toHaveTextContent(
      "header-answer",
    );
    const rows = screen.getAllByTestId("submission-row");
    expect(rows).toHaveLength(2);
    expect(screen.getAllByTestId("submission-created-at")[0]).toHaveTextContent(
      "2023-10-01T00:30:00Z",
    );
    expect(screen.getAllByTestId("submission-member")[0]).toHaveTextContent(
      "Test User",
    );
    expect(screen.getAllByTestId("submission-problem")[0]).toHaveTextContent(
      "A",
    );
    expect(screen.getAllByTestId("submission-language")[0]).toHaveTextContent(
      "PYTHON_3_13_3",
    );
    expect(screen.getAllByTestId("submission-answer")[0]).toHaveTextContent(
      "ACCEPTED",
    );
  });

  it("should handle empty submissions", () => {
    mockUseAuthorizationContext.mockResolvedValueOnce({
      authorization: { member: { id: "1" } },
    });

    render(<TimelinePage submissions={[]} />);

    expect(screen.getByTestId("submission-empty")).toBeInTheDocument();
  });
});
