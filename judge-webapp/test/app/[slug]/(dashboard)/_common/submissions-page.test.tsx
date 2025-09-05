import { fireEvent, screen } from "@testing-library/dom";
import { act } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions-page";
import { attachmentService, submissionService } from "@/config/composition";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useToast } from "@/lib/util/toast-hook";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockProblemFullResponseDTO } from "@/test/mock/response/problem/MockProblemFullResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionsPage", () => {
  const submissions = [
    MockSubmissionFullResponseDTO(),
    MockSubmissionFullResponseDTO(),
  ];
  const problems = [MockProblemFullResponseDTO(), MockProblemFullResponseDTO()];
  const languages = [Language.CPP_17, Language.JAVA_21];

  it("should render create variant", async () => {
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canCreate
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata: MockContestMetadataResponseDTO(),
      },
    );

    expect(document.title).toBe("Judge - Submissions");
    expect(screen.getByTestId("create-form-title")).toHaveTextContent(
      "Create Submission",
    );
    expect(screen.getByLabelText("Problem")).toBeEnabled();
    expect(screen.getByLabelText("Code")).toBeEnabled();
    expect(screen.getByLabelText("Code")).toBeEnabled();
    expect(screen.getByTestId("create-form-submit")).toBeEnabled();

    expect(screen.getAllByTestId("submission")).toHaveLength(2);
    expect(
      screen.getAllByTestId("submission-member-name")[0],
    ).toHaveTextContent("Test User");
    expect(
      screen.getAllByTestId("submission-problem-letter")[0],
    ).toHaveTextContent("A");
    expect(screen.getAllByTestId("submission-language")[0]).toHaveTextContent(
      "C++ 17",
    );
    expect(screen.getAllByTestId("submission-answer")[0]).toHaveTextContent(
      "Accepted",
    );
    expect(screen.queryByTestId("submission-status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("submission-actions")).not.toBeInTheDocument();
  });

  it("should render edit variant", async () => {
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canEdit
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata: MockContestMetadataResponseDTO(),
      },
    );

    expect(screen.queryByTestId("create-form")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("submission-status")[0]).toHaveTextContent(
      "Judged",
    );
    expect(screen.getAllByTestId("submission-download")[0]).toBeEnabled();
    expect(screen.getAllByTestId("submission-resubmit")[0]).toBeEnabled();
    expect(screen.getAllByTestId("submission-judge")[0]).toBeEnabled();
  });

  it("should handle create success", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canCreate
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    fireEvent.change(screen.getByLabelText("Problem"), {
      target: { value: problems[0].id },
    });
    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: languages[0] },
    });
    const code = new File(["code"], "hello.cpp", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("Code"), {
      target: {
        files: [code],
      },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-form-submit"));
    });

    expect(submissionService.createSubmission).toHaveBeenCalledWith(
      contestMetadata.id,
      {
        problemId: problems[0].id,
        language: languages[0],
        code,
      },
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle create error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    (submissionService.createSubmission as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to create"),
    );
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canCreate
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    fireEvent.change(screen.getByLabelText("Problem"), {
      target: { value: problems[0].id },
    });
    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: languages[0] },
    });
    const code = new File(["code"], "hello.cpp", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("Code"), {
      target: {
        files: [code],
      },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-form-submit"));
    });

    expect(submissionService.createSubmission).toHaveBeenCalledWith(
      contestMetadata.id,
      {
        problemId: problems[0].id,
        language: languages[0],
        code,
      },
    );
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle download", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canEdit
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("submission-download")[0]);
    });

    expect(attachmentService.download).toHaveBeenCalledWith(
      submissions[1].code,
    );
  });

  it("should handle resubmit success", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canEdit
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("submission-resubmit")[0]);
    });

    const resubmitModal = screen.getByTestId("resubmit-modal");
    expect(resubmitModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(
        resubmitModal.querySelector("[data-testid='confirm']") as any,
      );
    });

    expect(submissionService.rerunSubmission).toHaveBeenCalledWith(
      contestMetadata.id,
      submissions[1].id,
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle resubmit error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    (submissionService.rerunSubmission as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to resubmit"),
    );
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canEdit
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("submission-resubmit")[0]);
    });

    const resubmitModal = screen.getByTestId("resubmit-modal");
    expect(resubmitModal).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(
        resubmitModal.querySelector("[data-testid='confirm']") as any,
      );
    });

    expect(submissionService.rerunSubmission).toHaveBeenCalledWith(
      contestMetadata.id,
      submissions[1].id,
    );
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle judge success", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canEdit
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("submission-judge")[0]);
    });

    const judgeModal = screen.getByTestId("judge-modal");
    expect(judgeModal).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Answer"), {
      target: { value: SubmissionAnswer.ACCEPTED },
    });
    await act(async () => {
      fireEvent.click(
        judgeModal.querySelector("[data-testid='confirm']") as any,
      );
    });

    expect(submissionService.updateSubmissionAnswer).toHaveBeenCalledWith(
      contestMetadata.id,
      submissions[1].id,
      SubmissionAnswer.ACCEPTED,
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle judge error", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    (
      submissionService.updateSubmissionAnswer as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to judge"));
    await renderWithProviders(
      <SubmissionsPage
        submissions={submissions}
        problems={problems}
        languages={languages}
        canEdit
      />,
      {
        authorization: MockAuthorization(),
        contestMetadata,
      },
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("submission-judge")[0]);
    });

    const judgeModal = screen.getByTestId("judge-modal");
    expect(judgeModal).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Answer"), {
      target: { value: SubmissionAnswer.ACCEPTED },
    });
    await act(async () => {
      fireEvent.click(
        judgeModal.querySelector("[data-testid='confirm']") as any,
      );
    });

    expect(submissionService.updateSubmissionAnswer).toHaveBeenCalledWith(
      contestMetadata.id,
      submissions[1].id,
      SubmissionAnswer.ACCEPTED,
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
