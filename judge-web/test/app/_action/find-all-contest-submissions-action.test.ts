import { renderHook, waitFor } from "@testing-library/react";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { contestService, submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { useFindAllContestSubmissionsAction } from "@/app/_action/find-all-contest-submissions-action";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findAllContestSubmissions: jest.fn(),
  },
  submissionService: {
    subscribeForContest: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("@/app/contests/[slug]/_util/submissions-calculator", () => ({
  recalculatePublicSubmissions: jest.fn(),
}));

describe("useFindAllSubmissionsAction", () => {
  const mockAlertError = jest.fn();
  const mockFindAllSubmissions = jest.fn();
  const mockSubscribeForContest = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockRecalculatePublicSubmissions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (contestService.findAllContestSubmissions as jest.Mock).mockImplementation(
      mockFindAllSubmissions,
    );
    (submissionService.subscribeForContest as jest.Mock).mockImplementation(
      mockSubscribeForContest,
    );
    (submissionService.unsubscribe as jest.Mock).mockImplementation(
      mockUnsubscribe,
    );
    (recalculateSubmissions as jest.Mock).mockImplementation(
      mockRecalculatePublicSubmissions,
    );
  });

  it("should return submissions successfully and subscribe", async () => {
    const mockSubmissions = [{ id: "s1" }, { id: "s2" }];
    const mockStompClient = { id: "stompClient1" };

    mockFindAllSubmissions.mockResolvedValue(mockSubmissions);
    mockSubscribeForContest.mockResolvedValue(mockStompClient);

    const { result, unmount } = renderHook(() =>
      useFindAllContestSubmissionsAction(),
    );
    const { act: findAllSubmissionsAction } = result.current;

    const contestId = "123";
    let returnedSubmissions;

    await waitFor(async () => {
      returnedSubmissions = await findAllSubmissionsAction(contestId);
    });

    expect(contestService.findAllContestSubmissions).toHaveBeenCalledWith(
      contestId,
    );
    expect(returnedSubmissions).toEqual(mockSubmissions);
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show an error alert when an error occurs during fetching submissions", async () => {
    mockFindAllSubmissions.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useFindAllContestSubmissionsAction());
    const { act: findAllSubmissionsAction } = result.current;

    const contestId = "123";
    let returnedSubmissions;
    await waitFor(async () => {
      returnedSubmissions = await findAllSubmissionsAction(contestId);
    });

    expect(contestService.findAllContestSubmissions).toHaveBeenCalledWith(
      contestId,
    );
    expect(returnedSubmissions).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalled();
    expect(submissionService.subscribeForContest).not.toHaveBeenCalled();
  });
});
