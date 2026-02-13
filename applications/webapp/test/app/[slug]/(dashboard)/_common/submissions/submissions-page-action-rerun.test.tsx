import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionRerun } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-rerun";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { submissionWritter } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionRerun", () => {
  it("should handle resubmitSubmission successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    const onClose = jest.fn();
    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionRerun
            submission={submission}
            onClose={onClose}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contestMetadata },
    );

    fireEvent.click(screen.getByTestId("submissions-page-action-rerun"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(submissionWritter.rerun).toHaveBeenCalledWith(
      contestMetadata.id,
      submission.id,
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
