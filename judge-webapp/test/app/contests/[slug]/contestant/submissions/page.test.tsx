import { Language } from "@/core/domain/enumerate/Language";
import { act, fireEvent, render, screen } from "@testing-library/react";
import ContestantSubmissionPage from "@/app/contests/[slug]/contestant/submissions/page";
import { problemService, storageService } from "@/config/composition";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { mockAlert } from "@/test/jest.setup";
import { StorageService } from "@/core/service/StorageService";

jest.mock("@/config/composition");
jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: jest.fn(() => ({
    formatLanguage: jest.fn((language) => language),
  })),
}));
jest.mock(
  "@/app/contests/[slug]/contestant/submissions/_form/submission-form-map",
  () => ({
    SubmissionFormMap: {
      toInputDTO: jest.fn((data) => data),
    },
  }),
);
jest.mock(
  "@/app/contests/[slug]/_component/badge/submission-answer-badge",
  () => ({
    SubmissionAnswerBadge: jest.fn(({ answer }) => answer),
  }),
);
jest.mock("@/app/_component/timestamp-display", () => ({
  TimestampDisplay: jest.fn(({ timestamp }) => timestamp),
}));
jest.mock(
  "@/app/contests/[slug]/contestant/_context/contestant-context",
  () => ({
    useContestantContext: jest.fn(() => ({
      contest: {
        languages: [Language.PYTHON_3_13_3],
        problems: [{ id: "1" }],
      },
      memberSubmissions: [],
      addMemberSubmission: jest.fn(),
    })),
  }),
);

describe("ContestantSubmissionPage", () => {
  it("should render all components on startup with default language", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(
      Language.PYTHON_3_13_3,
    );
    (useContestantContext as jest.Mock).mockReturnValue({
      contest: {
        languages: [Language.PYTHON_3_13_3],
        problems: [{ id: "1" }],
      },
      memberSubmissions: [
        {
          id: "2",
          createdAt: "2025-01-01T00:00:00Z",
          problem: { letter: "A" },
          language: Language.PYTHON_3_13_3,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ],
      addMemberSubmission: jest.fn(),
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    expect(screen.getByTestId("form-submission")).toBeInTheDocument();
    expect(screen.getByTestId("form-problem")).not.toBeDisabled();
    expect(screen.getByTestId("form-language")).toHaveValue(
      Language.PYTHON_3_13_3,
    );
    expect(screen.getByTestId("form-code")).not.toBeDisabled();
    expect(screen.getByTestId("form-submit")).toHaveTextContent("submit:label");

    expect(screen.getByTestId("header-timestamp")).toHaveTextContent(
      "header-timestamp",
    );
    expect(screen.getByTestId("header-problem")).toHaveTextContent(
      "header-problem",
    );
    expect(screen.getByTestId("header-language")).toHaveTextContent(
      "header-language",
    );
    expect(screen.getByTestId("header-answer")).toHaveTextContent(
      "header-answer",
    );

    expect(screen.getAllByTestId("submission-row")).toHaveLength(1);
    expect(screen.getByTestId("submission-created-at")).toHaveTextContent(
      "2025-01-01T00:00:00Z",
    );
    expect(screen.getByTestId("submission-title")).toHaveTextContent("A");
    expect(screen.getByTestId("submission-language")).toHaveTextContent(
      Language.PYTHON_3_13_3,
    );
    expect(screen.getByTestId("submission-answer")).toHaveTextContent(
      SubmissionAnswer.ACCEPTED,
    );
  });

  it("should not start with default language if not set", () => {
    (storageService.getKey as jest.Mock).mockReturnValueOnce(undefined);

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    expect(screen.getByTestId("form-language")).not.toHaveValue();
  });

  it("should render empty submission list when no submissions exist", () => {
    (useContestantContext as jest.Mock).mockReturnValue({
      contest: {
        languages: [Language.PYTHON_3_13_3],
        problems: [{ id: "1" }],
      },
      memberSubmissions: [],
      addMemberSubmission: jest.fn(),
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    expect(screen.queryByTestId("submission-row")).not.toBeInTheDocument();
    expect(screen.getByTestId("submissions-empty")).toHaveTextContent(
      "submissions-empty",
    );
  });

  it("should alert error when create fails", async () => {
    (problemService.createSubmission as jest.Mock).mockRejectedValueOnce(
      new Error("error"),
    );

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    fireEvent.change(screen.getByTestId("form-problem"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("form-language"), {
      target: { value: Language.PYTHON_3_13_3 },
    });
    fireEvent.change(screen.getByTestId("form-code"), {
      target: {
        files: [new File(["code"], "code.py", { type: "text/plain" })],
      },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });
    expect(mockAlert.error).toHaveBeenCalledWith("create-error");
  });

  it("should alert success when create succeeds", async () => {
    (problemService.createSubmission as jest.Mock).mockResolvedValueOnce({
      id: "3",
      language: Language.PYTHON_3_13_3,
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    fireEvent.change(screen.getByTestId("form-problem"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId("form-language"), {
      target: { value: Language.PYTHON_3_13_3 },
    });
    fireEvent.change(screen.getByTestId("form-code"), {
      target: {
        files: [new File(["code"], "code.py", { type: "text/plain" })],
      },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("form-submit"));
    });
    expect(storageService.setKey).toHaveBeenCalledWith(
      StorageService.ACTIVE_LANGUAGE_STORAGE_KEY,
      Language.PYTHON_3_13_3,
    );
    expect(mockAlert.success).toHaveBeenCalledWith("create-success");
  });
});
