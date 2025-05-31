import { render, screen } from "@testing-library/react";
import { SubmissionStatusBadge } from "@/app/contests/[id]/_component/submission-status-badge";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

describe("SubmissionStatusBadge", () => {
  it("renders neutral badge for status JUDGING", () => {
    render(<SubmissionStatusBadge status={SubmissionStatus.JUDGING} />);
    expect(screen.getByTestId("badge")).toHaveClass("badge-neutral");
  });

  it("renders success badge for status SUCCESS", () => {
    render(<SubmissionStatusBadge status={SubmissionStatus.ACCEPTED} />);
    expect(screen.getByTestId("badge")).toHaveClass("badge-success");
  });

  it("renders info badge for status TIME_LIMIT_EXCEEDED", () => {
    render(
      <SubmissionStatusBadge status={SubmissionStatus.TIME_LIMIT_EXCEEDED} />,
    );
    expect(screen.getByTestId("badge")).toHaveClass("badge-info");
  });

  it("renders warning badge for status RUNTIME_ERROR", () => {
    render(<SubmissionStatusBadge status={SubmissionStatus.RUNTIME_ERROR} />);
    expect(screen.getByTestId("badge")).toHaveClass("badge-warning");
  });

  it("renders warning badge for status COMPILATION_ERROR", () => {
    render(
      <SubmissionStatusBadge status={SubmissionStatus.COMPILATION_ERROR} />,
    );
    expect(screen.getByTestId("badge")).toHaveClass("badge-warning");
  });
});
