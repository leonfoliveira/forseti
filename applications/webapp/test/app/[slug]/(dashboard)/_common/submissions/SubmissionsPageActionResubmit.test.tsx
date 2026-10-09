import { fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionResubmit } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionResubmit";
import { MockSubmissionWithCodeAndExecutionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/feedback/ConfirmationDialog", () => ({
  ConfirmationDialog: ({
    isOpen,
    title,
  }: {
    isOpen: boolean;
    title: string;
  }) => (
    <div data-testid="confirmation" data-open={String(isOpen)}>
      {title}
    </div>
  ),
}));

describe("SubmissionsPageActionResubmit", () => {
  it("opens confirmation when selecting Resubmit", async () => {
    await renderWithProviders(
      <SubmissionsPageActionResubmit
        submission={MockSubmissionWithCodeAndExecutionResponseDTO()}
        onClose={jest.fn()}
        onResubmit={jest.fn()}
      />,
    );
    expect(screen.getByTestId("confirmation")).toHaveAttribute(
      "data-open",
      "false",
    );
    fireEvent.click(screen.getByTestId("submissions-page-action-resubmit"));
    expect(screen.getByTestId("confirmation")).toHaveAttribute(
      "data-open",
      "true",
    );
  });
});
