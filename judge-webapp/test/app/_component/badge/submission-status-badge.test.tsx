import { render, screen } from "@testing-library/react";

import { SubmissionStatusBadge } from "@/app/_component/badge/submission-status-badge";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

jest.mock("@/app/_component/badge/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
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
    expect(badge).not.toBeEmptyDOMElement();
  });
});
