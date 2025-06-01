import { renderHook, waitFor } from "@testing-library/react";
import { recalculatePublicSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { contestService, submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useFindAllSubmissionsAction } from "@/app/_action/find-all-submissions-action";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findAllSubmissions: jest.fn(),
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

jest.mock("@/app/contests/[id]/_util/submissions-calculator", () => ({
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
    (contestService.findAllSubmissions as jest.Mock).mockImplementation(
      mockFindAllSubmissions,
    );
    (submissionService.subscribeForContest as jest.Mock).mockImplementation(
      mockSubscribeForContest,
    );
    (submissionService.unsubscribe as jest.Mock).mockImplementation(
      mockUnsubscribe,
    );
    (recalculatePublicSubmissions as jest.Mock).mockImplementation(
      mockRecalculatePublicSubmissions,
    );
  });

  it("should return submissions successfully and subscribe", async () => {
    const mockSubmissions = [{ id: "s1" }, { id: "s2" }];
    const mockStompClient = { id: "stompClient1" };

    mockFindAllSubmissions.mockResolvedValue(mockSubmissions);
    mockSubscribeForContest.mockResolvedValue(mockStompClient);

    const { result, unmount } = renderHook(() => useFindAllSubmissionsAction());
    const { act: findAllSubmissionsAction } = result.current;

    const contestId = 123;
    let returnedSubmissions;

    await waitFor(async () => {
      returnedSubmissions = await findAllSubmissionsAction(contestId);
    });

    expect(contestService.findAllSubmissions).toHaveBeenCalledWith(contestId);
    expect(returnedSubmissions).toEqual(mockSubmissions);
    expect(submissionService.subscribeForContest).toHaveBeenCalledWith(
      contestId,
      expect.any(Function),
    );
    expect(mockAlertError).not.toHaveBeenCalled();

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });

  it("should show an error alert when an error occurs during fetching submissions", async () => {
    mockFindAllSubmissions.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useFindAllSubmissionsAction());
    const { act: findAllSubmissionsAction } = result.current;

    const contestId = 123;
    let returnedSubmissions;
    await waitFor(async () => {
      returnedSubmissions = await findAllSubmissionsAction(contestId);
    });

    expect(contestService.findAllSubmissions).toHaveBeenCalledWith(contestId);
    expect(returnedSubmissions).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalled();
    expect(submissionService.subscribeForContest).not.toHaveBeenCalled();
  });

  it("should update submissions when a new submission is received", async () => {
    const initialSubmissions: SubmissionPublicResponseDTO[] = [
      { id: "s1", status: "PENDING" } as unknown as SubmissionPublicResponseDTO,
    ];
    const mockStompClient = { id: "stompClient1" };

    mockFindAllSubmissions.mockResolvedValue(initialSubmissions);
    mockSubscribeForContest.mockImplementation(
      (
        contestId: number,
        callback: (submission: SubmissionPublicResponseDTO) => void,
      ) => {
        (global as any).__receiveSubmissionCallback = callback;
        return mockStompClient;
      },
    );

    const { result, unmount } = renderHook(() => useFindAllSubmissionsAction());
    const { act: findAllSubmissionsAction } = result.current;

    const contestId = 123;
    await waitFor(async () => {
      await findAllSubmissionsAction(contestId);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(initialSubmissions);
    });

    const newSubmission: SubmissionPublicResponseDTO = {
      id: "s2",
      status: "ACCEPTED",
    } as unknown as SubmissionPublicResponseDTO;
    const updatedSubmissions: SubmissionPublicResponseDTO[] = [
      ...initialSubmissions,
      newSubmission,
    ];

    mockRecalculatePublicSubmissions.mockReturnValue(updatedSubmissions);

    if ((global as any).__receiveSubmissionCallback) {
      await waitFor(() => {
        (global as any).__receiveSubmissionCallback(newSubmission);
      });
    }

    expect(recalculatePublicSubmissions).toHaveBeenCalledWith(
      initialSubmissions,
      newSubmission,
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(updatedSubmissions);
    });

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });
});
