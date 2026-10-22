import { render, screen } from "@testing-library/react";

import { PrintRequestStatusBadge } from "@/app/_lib/component/display/badge/PrintRequestStatusBadge";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

describe("PrintRequestStatusBadge", () => {
  it.each([
    [PrintRequestStatus.PENDING, "Pending", "badge-pending"],
    [PrintRequestStatus.COMPLETED, "Completed", "badge-completed"],
    [PrintRequestStatus.REFUSED, "Refused", "badge-refused"],
  ])("shows %s status", (status, label, testId) => {
    render(<PrintRequestStatusBadge status={status} />);
    expect(screen.getByTestId(testId)).toHaveTextContent(label);
  });
});
