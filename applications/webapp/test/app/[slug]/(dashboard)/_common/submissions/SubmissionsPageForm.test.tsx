import React from "react";
import { act, fireEvent, screen } from "@testing-library/react";

import { SubmissionsPageForm } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageForm";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import {
  MockContestResponseDTO,
  MockProblemResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { Composition } from "@/config/composition";
import { useToast } from "@/app/_lib/hook/useToast";

describe("SubmissionsPageForm", () => {
  it("creates submission successfully", async () => {
    const onClose = jest.fn();
    const onCreate = jest.fn();
    const problem = MockProblemResponseDTO();
    const contest = MockContestResponseDTO();
    const newSubmission = MockSubmissionWithCodeResponseDTO();
    (Composition.submissionWriter.create as jest.Mock).mockResolvedValue(
      newSubmission,
    );

    await renderWithProviders(
      <SubmissionsPageForm
        onClose={onClose}
        problems={[problem]}
        onCreate={onCreate}
      />,
      {
        contest,
      },
    );

    fireEvent.change(screen.getByTestId("submission-form-problem"), {
      target: { value: problem.id },
    });
    fireEvent.change(screen.getByTestId("submission-form-language"), {
      target: { value: SubmissionLanguage.CPP_17 },
    });
    fireEvent.change(screen.getByTestId("submission-form-code"), {
      target: {
        files: [new File(["code"], "code.cpp", { type: "text/plain" })],
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("submission-form-submit"));
    });

    expect(Composition.submissionWriter.create).toHaveBeenCalledWith(
      contest.id,
      expect.any(Object),
    );
    expect(onCreate).toHaveBeenCalledWith(newSubmission);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows toast on submission error", async () => {
    const onClose = jest.fn();
    const onCreate = jest.fn();
    const problem = MockProblemResponseDTO();
    const contest = MockContestResponseDTO();
    (Composition.submissionWriter.create as jest.Mock).mockRejectedValue(
      new Error("Submission failed"),
    );

    await renderWithProviders(
      <SubmissionsPageForm
        onClose={onClose}
        problems={[problem]}
        onCreate={onCreate}
      />,
      {
        contest,
      },
    );

    fireEvent.change(screen.getByTestId("submission-form-problem"), {
      target: { value: problem.id },
    });
    fireEvent.change(screen.getByTestId("submission-form-language"), {
      target: { value: SubmissionLanguage.CPP_17 },
    });
    fireEvent.change(screen.getByTestId("submission-form-code"), {
      target: {
        files: [new File(["code"], "code.cpp", { type: "text/plain" })],
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("submission-form-submit"));
    });

    expect(onCreate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(useToast().error).toHaveBeenCalled();
  });
});
