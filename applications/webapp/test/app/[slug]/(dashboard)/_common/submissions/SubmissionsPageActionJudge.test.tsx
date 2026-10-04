import { fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionJudge";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/MockDTOs";
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

describe("SubmissionsPageActionJudge", () => {
  it("opens the confirmation when selecting Judge", async () => {
    await renderWithProviders(
      <SubmissionsPageActionJudge
        submission={MockSubmissionWithCodeResponseDTO()}
        onClose={jest.fn()}
        onJudge={jest.fn()}
      />,
    );
    expect(screen.getByTestId("confirmation")).toHaveAttribute(
      "data-open",
      "false",
    );
    fireEvent.click(screen.getByTestId("submissions-page-action-judge"));
    expect(screen.getByTestId("confirmation")).toHaveAttribute(
      "data-open",
      "true",
    );
  });
});
