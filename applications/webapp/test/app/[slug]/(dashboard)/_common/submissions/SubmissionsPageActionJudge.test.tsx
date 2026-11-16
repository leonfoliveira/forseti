import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionJudge";
import {
  MockContestResponseDTO,
  MockSubmissionWithCodeAndExecutionsResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { Composition } from "@/config/composition";
import { useToast } from "@/app/_lib/hook/useToast";

describe("SubmissionsPageActionJudge", () => {
  it("updates the submission answer successfully", async () => {
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    const onJudge = jest.fn();
    const onClose = jest.fn();
    const updatedSubmission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    (
      Composition.submissionWriter.updateAnswer as jest.Mock
    ).mockResolvedValueOnce(updatedSubmission);

    await renderWithProviders(
      <SubmissionsPageActionJudge
        submission={submission}
        onClose={onClose}
        onJudge={onJudge}
      />,
      { contest },
    );

    fireEvent.change(screen.getByTestId("submission-judge-form-answer"), {
      target: { value: SubmissionAnswer.ACCEPTED },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.submissionWriter.updateAnswer).toHaveBeenCalledWith(
      contest.id,
      submission.id,
      SubmissionAnswer.ACCEPTED,
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(onJudge).toHaveBeenCalledWith(updatedSubmission);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows toast on update failure", async () => {
    const error = new Error("Failed to update submission answer");
    (
      Composition.submissionWriter.updateAnswer as jest.Mock
    ).mockRejectedValueOnce(error);
    const contest = MockContestResponseDTO();
    const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();

    await renderWithProviders(
      <SubmissionsPageActionJudge
        submission={submission}
        onClose={jest.fn()}
        onJudge={jest.fn()}
      />,
      { contest },
    );

    fireEvent.change(screen.getByTestId("submission-judge-form-answer"), {
      target: { value: SubmissionAnswer.ACCEPTED },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
