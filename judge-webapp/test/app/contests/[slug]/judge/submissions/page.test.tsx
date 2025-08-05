import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";
import { act, fireEvent, render, screen } from "@testing-library/react";
import JudgeSubmissionsPage from "@/app/contests/[slug]/judge/submissions/page";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { submissionService } from "@/config/composition";
import { mockAlert } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: jest.fn(() => ({
    formatLanguage: jest.fn((language) => language),
    formatSubmissionAnswer: jest.fn((answer) => answer),
  })),
}));
jest.mock(
  "@/app/contests/[slug]/_component/badge/submission-answer-badge",
  () => ({
    SubmissionAnswerBadge: jest.fn(({ answer }) => answer),
  }),
);
jest.mock(
  "@/app/contests/[slug]/_component/badge/submission-status-badge",
  () => ({
    SubmissionStatusBadge: jest.fn(({ status }) => status),
  }),
);
jest.mock("@/app/_component/timestamp-display", () => ({
  TimestampDisplay: jest.fn(({ timestamp }) => timestamp),
}));
jest.mock("@/app/contests/[slug]/judge/_context/judge-context", () => ({
  useJudgeContext: jest.fn(() => ({
    submissions: [],
  })),
}));
jest.mock("@/app/_component/dialog-modal", () => ({
  DialogModal: ({ children, modal, onConfirm }: any) => (
    <>
      {modal.isOpen && (
        <div data-testid="dialog-modal">
          {children}
          <button onClick={onConfirm} data-testid="dialog-modal:button" />
        </div>
      )}
    </>
  ),
}));

describe("JudgeSubmissionsPage", () => {
  it("should render all components on startup", () => {
    (useJudgeContext as jest.Mock).mockReturnValue({
      submissions: [
        {
          id: "1",
          createdAt: "2025-01-01T00:00:00Z",
          problem: { letter: "A" },
          language: Language.PYTHON_3_13,
          status: SubmissionStatus.JUDGED,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
    });

    render(<JudgeSubmissionsPage />);

    expect(screen.getByTestId("header-timestamp")).toHaveTextContent(
      "header-timestamp",
    );
    expect(screen.getByTestId("header-problem")).toHaveTextContent(
      "header-problem",
    );
    expect(screen.getByTestId("header-language")).toHaveTextContent(
      "header-language",
    );
    expect(screen.getByTestId("header-status")).toHaveTextContent(
      "header-status",
    );
    expect(screen.getByTestId("header-answer")).toHaveTextContent(
      "header-answer",
    );

    expect(screen.getAllByTestId("submission-row")).toHaveLength(1);
    expect(screen.getByTestId("submission-created-at")).toHaveTextContent(
      "2025-01-01T00:00:00Z",
    );
    expect(screen.getByTestId("submission-letter")).toHaveTextContent("A");
    expect(screen.getByTestId("submission-language")).toHaveTextContent(
      Language.PYTHON_3_13,
    );
    expect(screen.getByTestId("submission-status")).toHaveTextContent(
      SubmissionStatus.JUDGED,
    );
    expect(screen.getByTestId("submission-answer")).toHaveTextContent(
      SubmissionAnswer.ACCEPTED,
    );

    expect(screen.getByTestId("rerun")).not.toBeDisabled();
    expect(screen.getByTestId("update")).not.toBeDisabled();
    expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
  });

  it("should disable rerun when submission is judging", () => {
    (useJudgeContext as jest.Mock).mockReturnValue({
      submissions: [
        {
          id: "2",
          createdAt: "2025-01-02T00:00:00Z",
          problem: { letter: "B" },
          language: Language.PYTHON_3_13,
          status: SubmissionStatus.JUDGING,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
    });

    render(<JudgeSubmissionsPage />);

    expect(screen.getByTestId("rerun")).toBeDisabled();
  });

  it("should alert error on rerun failure", async () => {
    (useJudgeContext as jest.Mock).mockReturnValue({
      submissions: [
        {
          id: "2",
          createdAt: "2025-01-02T00:00:00Z",
          problem: { letter: "B" },
          language: Language.PYTHON_3_13,
          status: SubmissionStatus.JUDGED,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
    });
    (submissionService.rerunSubmission as jest.Mock).mockRejectedValueOnce(
      new Error("error"),
    );

    render(<JudgeSubmissionsPage />);

    act(() => {
      fireEvent.click(screen.getByTestId("rerun"));
    });

    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "confirm-rerun",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.error).toHaveBeenCalledWith("rerun-error");
  });

  it("should alert success on rerun success", async () => {
    (useJudgeContext as jest.Mock).mockReturnValue({
      submissions: [
        {
          id: "2",
          createdAt: "2025-01-02T00:00:00Z",
          problem: { letter: "B" },
          language: Language.PYTHON_3_13,
          status: SubmissionStatus.JUDGED,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
    });
    (submissionService.rerunSubmission as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    render(<JudgeSubmissionsPage />);

    act(() => {
      fireEvent.click(screen.getByTestId("rerun"));
    });

    expect(screen.getByTestId("dialog-modal")).toHaveTextContent(
      "confirm-rerun",
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.success).toHaveBeenCalledWith("rerun-success");
    expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
  });

  it("should alert error on update failure", async () => {
    (useJudgeContext as jest.Mock).mockReturnValue({
      submissions: [
        {
          id: "2",
          createdAt: "2025-01-02T00:00:00Z",
          problem: { letter: "B" },
          language: Language.PYTHON_3_13,
          status: SubmissionStatus.JUDGED,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
    });
    (
      submissionService.updateSubmissionAnswer as jest.Mock
    ).mockRejectedValueOnce(new Error("error"));

    render(<JudgeSubmissionsPage />);

    act(() => {
      fireEvent.click(screen.getByTestId("update"));
    });

    fireEvent.change(screen.getByTestId("update-form-answer"), {
      target: { value: SubmissionAnswer.WRONG_ANSWER },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.error).toHaveBeenCalledWith("update-error");
  });

  it("should alert success on update success", async () => {
    (useJudgeContext as jest.Mock).mockReturnValue({
      submissions: [
        {
          id: "2",
          createdAt: "2025-01-02T00:00:00Z",
          problem: { letter: "B" },
          language: Language.PYTHON_3_13,
          status: SubmissionStatus.JUDGED,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
    });
    (
      submissionService.updateSubmissionAnswer as jest.Mock
    ).mockResolvedValueOnce(undefined);

    render(<JudgeSubmissionsPage />);

    act(() => {
      fireEvent.click(screen.getByTestId("update"));
    });

    fireEvent.change(screen.getByTestId("update-form-answer"), {
      target: { value: SubmissionAnswer.WRONG_ANSWER },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-modal:button"));
    });

    expect(mockAlert.success).toHaveBeenCalledWith("update-success");
    expect(screen.queryByTestId("dialog-modal")).not.toBeInTheDocument();
  });
});
