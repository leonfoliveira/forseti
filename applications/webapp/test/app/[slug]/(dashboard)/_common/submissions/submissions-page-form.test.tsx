import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/submission-form";
import { SubmissionsPageForm } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-form";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageForm", () => {
  it("should create submission successfully", async () => {
    const newSubmission = MockSubmissionWithCodeResponseDTO();
    (Composition.submissionWritter.create as jest.Mock).mockResolvedValueOnce(
      newSubmission,
    );
    const contest = MockContestResponseDTO();
    const problems = [MockProblemResponseDTO()];
    const onClose = jest.fn();
    const onCreate = jest.fn();
    await renderWithProviders(
      <SubmissionsPageForm
        onClose={onClose}
        onCreate={onCreate}
        problems={problems}
      />,
      { contest },
    );

    const problemId = problems[0].id;
    const code = new File(["print('Hello, World!')"], "solution.py", {
      type: "text/x-python",
    });

    fireEvent.change(screen.getByTestId("submission-form-problem"), {
      target: { value: problemId },
    });
    fireEvent.change(screen.getByTestId("submission-form-language"), {
      target: { value: SubmissionLanguage.JAVA_21 },
    });
    fireEvent.change(screen.getByTestId("submission-form-code"), {
      target: { files: [code] },
    });

    fireEvent.click(screen.getByTestId("submission-form-cancel"));
    expect(onClose).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByTestId("submission-form-submit"));
    });

    expect(Composition.submissionWritter.create).toHaveBeenCalledWith(
      contest.id,
      SubmissionForm.toInputDTO({
        problemId,
        language: SubmissionLanguage.JAVA_21,
        code: [code],
      }),
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onCreate).toHaveBeenCalledWith(newSubmission);
  });

  it("should show error toast when creation fails", async () => {
    const contest = MockContestResponseDTO();
    const problems = [MockProblemResponseDTO()];
    const onClose = jest.fn();
    await renderWithProviders(
      <SubmissionsPageForm
        onClose={onClose}
        problems={problems}
        onCreate={() => {}}
      />,
      { contest },
    );

    (Composition.submissionWritter.create as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to create submission"),
    );

    const problemId = problems[0].id;
    const code = new File(["print('Hello, World!')"], "solution.py", {
      type: "text/x-python",
    });

    fireEvent.change(screen.getByTestId("submission-form-problem"), {
      target: { value: problemId },
    });
    fireEvent.change(screen.getByTestId("submission-form-language"), {
      target: { value: SubmissionLanguage.JAVA_21 },
    });
    fireEvent.change(screen.getByTestId("submission-form-code"), {
      target: { files: [code] },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("submission-form-submit"));
    });

    expect(useToast().error).toHaveBeenCalled();
  });
});
