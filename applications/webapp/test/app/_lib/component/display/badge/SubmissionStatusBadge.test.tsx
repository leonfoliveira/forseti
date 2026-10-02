import { render, screen } from "@testing-library/react";

import { SubmissionStatusBadge } from "@/app/_lib/component/display/badge/SubmissionStatusBadge";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";

describe("SubmissionStatusBadge", () => {
  it.each([
    [SubmissionStatus.JUDGED, "Judged", "badge-judged"],
    [SubmissionStatus.FAILED, "Failed", "badge-failed"],
    [SubmissionStatus.JUDGING, "Judging", "badge-judging"],
  ])("shows %s state", (status, text, id) => {
    render(<SubmissionStatusBadge status={status} />);
    expect(screen.getByTestId(id)).toHaveTextContent(text);
  });
});
