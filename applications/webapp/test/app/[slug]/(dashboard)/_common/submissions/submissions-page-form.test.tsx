import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionForm } from "@/app/[slug]/(dashboard)/_common/submissions/submission-form";
import { SubmissionsPageForm } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-form";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { submissionWritter } from "@/config/composition";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPageForm", () => {
  it("should create submission successfully", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [MockProblemPublicResponseDTO()];
    const onClose = jest.fn();
    await renderWithProviders(
      <SubmissionsPageForm onClose={onClose} problems={problems} />,
      { contestMetadata },
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

    expect(submissionWritter.create).toHaveBeenCalledWith(
      contestMetadata.id,
      SubmissionForm.toInputDTO({
        problemId,
        language: SubmissionLanguage.JAVA_21,
        code: [code],
      }),
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should show error toast when creation fails", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [MockProblemPublicResponseDTO()];
    const onClose = jest.fn();
    await renderWithProviders(
      <SubmissionsPageForm onClose={onClose} problems={problems} />,
      { contestMetadata },
    );

    (submissionWritter.create as jest.Mock).mockRejectedValueOnce(
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
