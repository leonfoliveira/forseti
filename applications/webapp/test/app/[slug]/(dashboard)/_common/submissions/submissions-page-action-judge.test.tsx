import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-judge";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useToast } from "@/app/_lib/util/toast-hook";
import { submissionWritter } from "@/config/composition";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageActionJudge", () => {
  it("should handle updateAnswer succesfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionJudge submission={submission} />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contestMetadata },
    );

    fireEvent.click(screen.getByTestId("submissions-page-action-judge"));
    fireEvent.change(screen.getByTestId("submission-judge-form-answer"), {
      target: { value: "ACCEPTED" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-confirm-button"));
    });

    expect(submissionWritter.updateAnswer).toHaveBeenCalledWith(
      contestMetadata.id,
      submission.id,
      "ACCEPTED",
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle updateAnswer failure", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const submission = MockSubmissionFullResponseDTO();
    (submissionWritter.updateAnswer as jest.Mock).mockRejectedValueOnce(
      new Error("Failed"),
    );
    await renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuContent>
          <SubmissionsPageActionJudge submission={submission} />
        </DropdownMenuContent>
      </DropdownMenu>,
      { contestMetadata },
    );

    fireEvent.click(screen.getByTestId("submissions-page-action-judge"));
    fireEvent.change(screen.getByTestId("submission-judge-form-answer"), {
      target: { value: "WRONG_ANSWER" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-confirm-button"));
    });

    expect(submissionWritter.updateAnswer).toHaveBeenCalledWith(
      contestMetadata.id,
      submission.id,
      "WRONG_ANSWER",
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
