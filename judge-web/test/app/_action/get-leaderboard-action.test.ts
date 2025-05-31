import { renderHook, waitFor } from "@testing-library/react";
import { recalculateLeaderboard } from "@/app/contests/[id]/leaderboard/util/leaderboard-calculator";
import { contestService, submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useGetLeaderboardAction } from "@/app/_action/get-leaderboard-action";

jest.mock("@/app/_composition", () => ({
  contestService: {
    getLeaderboard: jest.fn(),
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

jest.mock(
  "@/app/contests/[id]/leaderboard/util/leaderboard-calculator",
  () => ({
    recalculateLeaderboard: jest.fn(),
  }),
);

describe("useGetLeaderboardAction", () => {
  const mockAlertError = jest.fn();
  const mockGetLeaderboard = jest.fn();
  const mockSubscribeForContest = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockRecalculateLeaderboard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (contestService.getLeaderboard as jest.Mock).mockImplementation(
      mockGetLeaderboard,
    );
    (submissionService.subscribeForContest as jest.Mock).mockImplementation(
      mockSubscribeForContest,
    );
    (submissionService.unsubscribe as jest.Mock).mockImplementation(
      mockUnsubscribe,
    );
    (recalculateLeaderboard as jest.Mock).mockImplementation(
      mockRecalculateLeaderboard,
    );
  });

  it("should return leaderboard successfully and subscribe", async () => {
    const mockLeaderboard = [{ memberId: 1, score: 100 }];
    const mockStompClient = { id: "stompClient1" };

    mockGetLeaderboard.mockResolvedValue(mockLeaderboard);
    mockSubscribeForContest.mockResolvedValue(mockStompClient);

    const { result, unmount } = renderHook(() => useGetLeaderboardAction());
    const { act: getLeaderboardAction } = result.current;

    const contestId = 123;
    let returnedLeaderboard;

    await waitFor(async () => {
      returnedLeaderboard = await getLeaderboardAction(contestId);
    });

    expect(contestService.getLeaderboard).toHaveBeenCalledWith(contestId);
    expect(returnedLeaderboard).toEqual(mockLeaderboard);
    expect(submissionService.subscribeForContest).toHaveBeenCalledWith(
      contestId,
      expect.any(Function),
    );
    expect(mockAlertError).not.toHaveBeenCalled();

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });

  it("should show an error alert when an error occurs during fetching leaderboard", async () => {
    mockGetLeaderboard.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useGetLeaderboardAction());
    const { act: getLeaderboardAction } = result.current;

    const contestId = 123;
    let returnedLeaderboard;
    await waitFor(async () => {
      returnedLeaderboard = await getLeaderboardAction(contestId);
    });

    expect(contestService.getLeaderboard).toHaveBeenCalledWith(contestId);
    expect(returnedLeaderboard).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalledWith("Error loading leaderboard");
    expect(submissionService.subscribeForContest).not.toHaveBeenCalled();
  });

  it("should update leaderboard when a new submission is received", async () => {
    const initialLeaderboard = [{ memberId: 1, score: 50 }];
    const mockStompClient = { id: "stompClient1" };

    mockGetLeaderboard.mockResolvedValue(initialLeaderboard);
    mockSubscribeForContest.mockImplementation(
      (
        contestId: number,
        callback: (submission: SubmissionPublicResponseDTO) => void,
      ) => {
        (global as any).__onSubmissionCallback = callback;
        return mockStompClient;
      },
    );

    const { result, unmount } = renderHook(() => useGetLeaderboardAction());
    const { act: getLeaderboardAction } = result.current;

    const contestId = 123;
    await waitFor(async () => {
      await getLeaderboardAction(contestId);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(initialLeaderboard);
    });

    const newSubmission: SubmissionPublicResponseDTO = {
      id: "s1",
      contestId: contestId,
      status: "ACCEPTED",
    } as unknown as SubmissionPublicResponseDTO;
    const updatedLeaderboard = [{ memberId: 1, score: 100 }];

    mockRecalculateLeaderboard.mockReturnValue(updatedLeaderboard);

    if ((global as any).__onSubmissionCallback) {
      await waitFor(() => {
        (global as any).__onSubmissionCallback(newSubmission);
      });
    }

    expect(recalculateLeaderboard).toHaveBeenCalledWith(
      initialLeaderboard,
      newSubmission,
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(updatedLeaderboard);
    });

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });
});
