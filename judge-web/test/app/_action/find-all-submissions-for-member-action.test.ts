import { renderHook, waitFor } from "@testing-library/react";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { recalculatePrivateSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { useFindAllSubmissionsForMemberAction } from "@/app/_action/find-all-submissions-for-member-action";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  submissionService: {
    findAllForMember: jest.fn(),
    subscribeForMember: jest.fn(),
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
  recalculatePrivateSubmissions: jest.fn(),
}));

describe("useFindAllSubmissionsForMemberAction", () => {
  const mockAlertError = jest.fn();
  const mockFindAllForMember = jest.fn();
  const mockSubscribeForMember = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockRecalculatePrivateSubmissions = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (submissionService.findAllForMember as jest.Mock).mockImplementation(
      mockFindAllForMember,
    );
    (submissionService.subscribeForMember as jest.Mock).mockImplementation(
      mockSubscribeForMember,
    );
    (submissionService.unsubscribe as jest.Mock).mockImplementation(
      mockUnsubscribe,
    );
    (recalculatePrivateSubmissions as jest.Mock).mockImplementation(
      mockRecalculatePrivateSubmissions,
    );
    (require("next/navigation").redirect as jest.Mock).mockImplementation(
      mockRedirect,
    );
  });

  it("should return submissions successfully and subscribe", async () => {
    const mockSubmissions = [{ id: "s1" }, { id: "s2" }];
    const mockStompClient = { id: "stompClient1" };

    mockFindAllForMember.mockResolvedValue(mockSubmissions);
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result, unmount } = renderHook(() =>
      useFindAllSubmissionsForMemberAction(),
    );
    const { act: findAllForMemberAction } = result.current;

    const contestId = 123;
    const memberId = 456;
    let returnedSubmissions;

    await waitFor(async () => {
      returnedSubmissions = await findAllForMemberAction(contestId, memberId);
    });

    expect(submissionService.findAllForMember).toHaveBeenCalledTimes(1);
    expect(returnedSubmissions).toEqual(mockSubmissions);
    expect(submissionService.subscribeForMember).toHaveBeenCalledWith(
      memberId,
      expect.any(Function),
    );
    expect(mockAlertError).not.toHaveBeenCalled();

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new ForbiddenException("Forbidden"),
  ])("should redirect on %p", async (exception) => {
    mockFindAllForMember.mockRejectedValue(exception);

    const { result } = renderHook(() => useFindAllSubmissionsForMemberAction());
    const { act: findAllForMemberAction } = result.current;

    const contestId = 123;
    const memberId = 456;

    await waitFor(async () => {
      await findAllForMemberAction(contestId, memberId);
    });

    expect(mockRedirect).toHaveBeenCalledWith(`/auth/contests/${contestId}`);
    expect(submissionService.findAllForMember).toHaveBeenCalledTimes(1);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(submissionService.subscribeForMember).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network Error");
    mockFindAllForMember.mockRejectedValue(genericError);

    const { result } = renderHook(() => useFindAllSubmissionsForMemberAction());
    const { act: findAllForMemberAction } = result.current;

    const contestId = 123;
    const memberId = 456;
    let returnedSubmissions;
    await waitFor(async () => {
      returnedSubmissions = await findAllForMemberAction(contestId, memberId);
    });

    expect(submissionService.findAllForMember).toHaveBeenCalledTimes(1);
    expect(returnedSubmissions).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalledWith("Error loading submissions");
    expect(submissionService.subscribeForMember).not.toHaveBeenCalled();
  });

  it("should update submissions when a new submission is received", async () => {
    const initialSubmissions: SubmissionPublicResponseDTO[] = [
      { id: "s1", status: "PENDING" } as unknown as SubmissionPublicResponseDTO,
    ];
    const mockStompClient = { id: "stompClient1" };

    mockFindAllForMember.mockResolvedValue(initialSubmissions);
    mockSubscribeForMember.mockImplementation(
      (
        memberId: number,
        callback: (submission: SubmissionPublicResponseDTO) => void,
      ) => {
        (global as any).__receiveSubmissionCallback = callback;
        return mockStompClient;
      },
    );

    const { result, unmount } = renderHook(() =>
      useFindAllSubmissionsForMemberAction(),
    );
    const { act: findAllForMemberAction } = result.current;

    const contestId = 123;
    const memberId = 456;
    await waitFor(async () => {
      await findAllForMemberAction(contestId, memberId);
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

    mockRecalculatePrivateSubmissions.mockReturnValue(updatedSubmissions);

    if ((global as any).__receiveSubmissionCallback) {
      await waitFor(() => {
        (global as any).__receiveSubmissionCallback(newSubmission);
      });
    }

    expect(recalculatePrivateSubmissions).toHaveBeenCalledWith(
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
