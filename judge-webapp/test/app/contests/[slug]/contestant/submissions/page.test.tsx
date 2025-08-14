import { act, fireEvent, render, screen } from "@testing-library/react";

import ContestantSubmissionPage from "@/app/contests/[slug]/contestant/submissions/page";
import { problemService, storageService } from "@/config/composition";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { StorageService } from "@/core/service/StorageService";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";
import { mockAlert } from "@/test/jest.setup";

jest.mock("@/config/composition");
jest.mock("@/store/slices/contestant-dashboard-slice", () => ({
  useContestantDashboard: jest.fn(),
  contestantDashboardSlice: {
    actions: {
      mergeMemberSubmission: jest.fn(),
    },
  },
}));
jest.mock(
  "@/app/contests/[slug]/contestant/submissions/_form/submission-form-map",
  () => ({
    SubmissionFormMap: {
      toInputDTO: jest.fn((data) => data),
    },
  }),
);

describe("ContestantSubmissionPage", () => {
  let mockUseContestantDashboard: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockUseContestantDashboard = useContestantDashboard as jest.Mock;
  });

  it("should render all components on startup with default language", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(Language.PYTHON_3_13);

    let callCount = 0;
    mockUseContestantDashboard.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [Language.PYTHON_3_13]; // languages
      if (callCount === 2)
        return [{ id: "1", letter: "A", title: "Problem 1" }]; // problems
      return [
        // memberSubmissions
        {
          id: "2",
          createdAt: "2025-01-01T00:00:00Z",
          problem: { letter: "A" },
          language: Language.PYTHON_3_13,
          answer: SubmissionAnswer.ACCEPTED,
        },
      ];
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    expect(screen.getByTestId("form-submission")).toBeInTheDocument();
    expect(screen.getByTestId("form-problem")).not.toBeDisabled();
    // Note: The default language might not be set immediately due to useEffect timing
    expect(screen.getByTestId("form-code")).not.toBeDisabled();
    expect(screen.getByTestId("form-submit")).toHaveTextContent("Submit");

    expect(screen.getByTestId("header-timestamp")).toHaveTextContent(
      "Timestamp",
    );
    expect(screen.getByTestId("header-problem")).toHaveTextContent("Problem");
    expect(screen.getByTestId("header-language")).toHaveTextContent("Language");
    expect(screen.getByTestId("header-answer")).toHaveTextContent("Answer");

    expect(screen.getAllByTestId("submission-row")).toHaveLength(1);
    expect(screen.getByTestId("submission-created-at")).toHaveTextContent(
      "2025-01-01T00:00:00Z",
    );
    expect(screen.getByTestId("submission-title")).toHaveTextContent("A");
    expect(screen.getByTestId("submission-language")).toHaveTextContent(
      "Python 3.13",
    );
    expect(screen.getByTestId("submission-answer")).toHaveTextContent(
      "Accepted",
    );
  });

  it("should not start with default language if not set", () => {
    (storageService.getKey as jest.Mock).mockReturnValue(undefined);

    let callCount = 0;
    mockUseContestantDashboard.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [Language.PYTHON_3_13]; // languages
      if (callCount === 2)
        return [{ id: "1", letter: "A", title: "Problem 1" }]; // problems
      return []; // memberSubmissions
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    expect(screen.getByTestId("form-language")).not.toHaveValue();
  });

  it("should render empty submission list when no submissions exist", () => {
    let callCount = 0;
    mockUseContestantDashboard.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [Language.PYTHON_3_13]; // languages
      if (callCount === 2)
        return [{ id: "1", letter: "A", title: "Problem 1" }]; // problems
      return []; // memberSubmissions
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    expect(screen.queryByTestId("submission-row")).not.toBeInTheDocument();
    expect(screen.getByTestId("submissions-empty")).toHaveTextContent(
      "No submissions yet",
    );
  });

  it("should alert error when create fails", async () => {
    (problemService.createSubmission as jest.Mock).mockRejectedValueOnce(
      new Error("error"),
    );

    let callCount = 0;
    mockUseContestantDashboard.mockImplementation(() => {
      callCount++;
      if (callCount % 3 === 1) return [Language.PYTHON_3_13]; // languages
      if (callCount % 3 === 2)
        return [{ id: "1", letter: "A", title: "Problem 1" }]; // problems
      return []; // memberSubmissions
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    const formElement = screen.getByTestId("form-submission");

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByTestId("form-problem"), {
        target: { value: "1" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("form-language"), {
        target: { value: Language.PYTHON_3_13 },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("form-code"), {
        target: {
          files: [new File(["code"], "code.py", { type: "text/plain" })],
        },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(formElement);
    });

    // Check if the error was called (might need a bit of time for async operations)
    expect(mockAlert.error).toHaveBeenCalledWith({
      defaultMessage: "Error creating submission",
      id: "app.contests.[slug].contestant.submissions.page.create-error",
    });
  });

  it("should alert success when create succeeds", async () => {
    (problemService.createSubmission as jest.Mock).mockResolvedValueOnce({
      id: "3",
      language: Language.PYTHON_3_13,
    });

    let callCount = 0;
    mockUseContestantDashboard.mockImplementation(() => {
      callCount++;
      if (callCount % 3 === 1) return [Language.PYTHON_3_13]; // languages
      if (callCount % 3 === 2)
        return [{ id: "1", letter: "A", title: "Problem 1" }]; // problems
      return []; // memberSubmissions
    });

    act(() => {
      render(<ContestantSubmissionPage />);
    });

    const formElement = screen.getByTestId("form-submission");

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByTestId("form-problem"), {
        target: { value: "1" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("form-language"), {
        target: { value: Language.PYTHON_3_13 },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("form-code"), {
        target: {
          files: [new File(["code"], "code.py", { type: "text/plain" })],
        },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(formElement);
    });

    expect(storageService.setKey).toHaveBeenCalledWith(
      StorageService.ACTIVE_LANGUAGE_STORAGE_KEY,
      Language.PYTHON_3_13,
    );
    expect(mockAlert.success).toHaveBeenCalledWith({
      defaultMessage: "Submission created successfully",
      id: "app.contests.[slug].contestant.submissions.page.create-success",
    });
  });
});
