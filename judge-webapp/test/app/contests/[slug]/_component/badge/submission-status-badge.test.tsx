import { SubmissionStatusBadge } from "@/app/contests/[slug]/_component/badge/submission-status-badge";
import { render, screen } from "@testing-library/react";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

jest.mock("@/app/_component/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: () => ({
    formatSubmissionStatus: (status: string) => status,
  }),
}));

describe("SubmissionStatusBadge", () => {
  it.each([
    [SubmissionStatus.JUDGED, "badge-success"],
    [SubmissionStatus.FAILED, "badge-error"],
    [SubmissionStatus.JUDGING, "badge-neutral"],
  ])("should render %s with correct class", (status, expectedClass) => {
    render(<SubmissionStatusBadge status={status} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass(expectedClass);
    expect(badge).toHaveTextContent(status);
  });
});
