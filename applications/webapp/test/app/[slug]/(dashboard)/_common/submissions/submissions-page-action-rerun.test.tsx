import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionRerun } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-rerun";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionRerun", () => {
  it("should handle resubmitSubmission successfully", async () => {
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    const onClose = jest.fn();
    const onRerun = jest.fn();
    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionRerun
            submission={submission}
            onClose={onClose}
            onRerun={onRerun}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contest },
    );

    fireEvent.click(screen.getByTestId("submissions-page-action-rerun"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.submissionWritter.rerun).toHaveBeenCalledWith(
      contest.id,
      submission.id,
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onRerun).toHaveBeenCalledWith({
      ...submission,
      status: SubmissionStatus.JUDGING,
      answer: SubmissionAnswer.NO_ANSWER,
    });
  });
});
