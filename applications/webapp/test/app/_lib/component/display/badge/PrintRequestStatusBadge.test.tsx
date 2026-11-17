import { screen } from "@testing-library/react";

import { PrintRequestStatusBadge } from "@/app/_lib/component/display/badge/PrintRequestStatusBadge";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";
import { renderWithProviders } from "@/test/render-with-providers";

describe("PrintRequestStatusBadge", () => {
  it.each([
    [PrintRequestStatus.PENDING, "Pending", "badge-pending"],
    [PrintRequestStatus.COMPLETED, "Completed", "badge-completed"],
    [PrintRequestStatus.REFUSED, "Refused", "badge-refused"],
  ])("shows %s status", async (status, label, testId) => {
    await renderWithProviders(<PrintRequestStatusBadge status={status} />);
    expect(screen.getByTestId(testId)).toHaveTextContent(label);
  });
});
