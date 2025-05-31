import { renderHook, waitFor } from "@testing-library/react";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { recalculateMemberProblems } from "@/app/contests/[id]/problems/_util/member-problem-calculator";
import { contestService, submissionService } from "@/app/_composition";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useFindAllProblemsForMemberAction } from "@/app/_action/find-all-problems-for-member-action";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findAllProblemsForMember: jest.fn(),
  },
  submissionService: {
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

jest.mock("@/app/_action/member-sign-out-action", () => ({
  useMemberSignOutAction: jest.fn(() => ({
    act: jest.fn(),
  })),
}));

jest.mock("@/app/_util/authorization-hook", () => ({
  useAuthorization: jest.fn(),
}));

jest.mock(
  "@/app/contests/[id]/problems/_util/member-problem-calculator",
  () => ({
    recalculateMemberProblems: jest.fn(),
  }),
);

describe("useFindAllProblemsForMemberAction", () => {
  const mockAlertError = jest.fn();
  const mockMemberSignOutAct = jest.fn();
  const mockSubscribeForMember = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockFindAllProblemsForMember = jest.fn();
  const mockRecalculateMemberProblems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (useMemberSignOutAction as jest.Mock).mockReturnValue({
      act: mockMemberSignOutAct,
    });
    (submissionService.subscribeForMember as jest.Mock).mockImplementation(
      mockSubscribeForMember,
    );
    (submissionService.unsubscribe as jest.Mock).mockImplementation(
      mockUnsubscribe,
    );
    (contestService.findAllProblemsForMember as jest.Mock).mockImplementation(
      mockFindAllProblemsForMember,
    );
    (recalculateMemberProblems as jest.Mock).mockImplementation(
      mockRecalculateMemberProblems,
    );
  });

  it("should return problems successfully and subscribe if member exists", async () => {
    const mockProblems = [{ id: "p1" }, { id: "p2" }];
    const mockMember = { id: "member123" };
    const mockStompClient = { id: "stompClient1" };

    mockFindAllProblemsForMember.mockResolvedValue(mockProblems);
    (useAuthorization as jest.Mock).mockReturnValue({ member: mockMember });
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result, unmount } = renderHook(() =>
      useFindAllProblemsForMemberAction(),
    );
    const { act: findAllProblemsForMemberAction } = result.current;

    const contestId = 123;
    let returnedProblems;

    await waitFor(async () => {
      returnedProblems = await findAllProblemsForMemberAction(contestId);
    });

    expect(contestService.findAllProblemsForMember).toHaveBeenCalledWith(
      contestId,
    );
    expect(returnedProblems).toEqual(mockProblems);
    expect(useAuthorization).toHaveBeenCalled();
    expect(submissionService.subscribeForMember).toHaveBeenCalledWith(
      mockMember.id,
      expect.any(Function),
    );
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockMemberSignOutAct).not.toHaveBeenCalled();

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });

  it("should return problems successfully and not subscribe if member does not exist", async () => {
    const mockProblems = [{ id: "p1" }, { id: "p2" }];
    mockFindAllProblemsForMember.mockResolvedValue(mockProblems);
    (useAuthorization as jest.Mock).mockReturnValue({ member: null });

    const { result, unmount } = renderHook(() =>
      useFindAllProblemsForMemberAction(),
    );
    const { act: findAllProblemsForMemberAction } = result.current;

    const contestId = 123;
    let returnedProblems;

    await waitFor(async () => {
      returnedProblems = await findAllProblemsForMemberAction(contestId);
    });

    expect(contestService.findAllProblemsForMember).toHaveBeenCalledWith(
      contestId,
    );
    expect(returnedProblems).toEqual(mockProblems);
    expect(useAuthorization).toHaveBeenCalled();
    expect(submissionService.subscribeForMember).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockMemberSignOutAct).not.toHaveBeenCalled();

    unmount();
    expect(submissionService.unsubscribe).not.toHaveBeenCalled();
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new ForbiddenException("Forbidden"),
  ])("should sign out on %p", async (exception) => {
    mockFindAllProblemsForMember.mockRejectedValue(exception);

    const { result } = renderHook(() => useFindAllProblemsForMemberAction());
    const { act: findAllProblemsForMemberAction } = result.current;

    const contestId = 123;
    await waitFor(async () => {
      await findAllProblemsForMemberAction(contestId);
    });

    expect(contestService.findAllProblemsForMember).toHaveBeenCalledWith(
      contestId,
    );
    expect(mockMemberSignOutAct).toHaveBeenCalledWith(contestId);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(submissionService.subscribeForMember).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network Error");
    mockFindAllProblemsForMember.mockRejectedValue(genericError);

    const { result } = renderHook(() => useFindAllProblemsForMemberAction());
    const { act: findAllProblemsForMemberAction } = result.current;

    const contestId = 123;
    await waitFor(async () => {
      await findAllProblemsForMemberAction(contestId);
    });

    expect(contestService.findAllProblemsForMember).toHaveBeenCalledWith(
      contestId,
    );
    expect(mockAlertError).toHaveBeenCalledWith("Error loading problems");
    expect(mockMemberSignOutAct).not.toHaveBeenCalled();
    expect(submissionService.subscribeForMember).not.toHaveBeenCalled();
  });

  it("should update problems when a new submission is received", async () => {
    const initialProblems = [{ id: "p1", submissions: [] }];
    const mockMember = { id: "member123" };
    const mockStompClient = { id: "stompClient1" };

    mockFindAllProblemsForMember.mockResolvedValue(initialProblems);
    (useAuthorization as jest.Mock).mockReturnValue({ member: mockMember });
    mockSubscribeForMember.mockImplementation(
      (memberId: string, callback: (submission: any) => void) => {
        (global as any).__receiveSubmissionCallback = callback;
        return mockStompClient;
      },
    );

    const { result, unmount } = renderHook(() =>
      useFindAllProblemsForMemberAction(),
    );
    const { act: findAllProblemsForMemberAction } = result.current;

    const contestId = 123;
    await waitFor(async () => {
      await findAllProblemsForMemberAction(contestId);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(initialProblems);
    });

    const newSubmissionJudging = {
      id: "s1",
      status: SubmissionStatus.JUDGING,
    };
    const newSubmissionAccepted = {
      id: "s2",
      status: SubmissionStatus.ACCEPTED,
    };
    const updatedProblems = [
      { id: "p1", submissions: [newSubmissionAccepted] },
    ];

    mockRecalculateMemberProblems.mockReturnValue(updatedProblems);

    // Simulate receiving a JUDGING submission (should not update data)
    if ((global as any).__receiveSubmissionCallback) {
      await waitFor(() => {
        (global as any).__receiveSubmissionCallback(newSubmissionJudging);
      });
    }
    expect(result.current.data).toEqual(initialProblems); // Data should remain unchanged

    // Simulate receiving a non-JUDGING submission (should update data)
    if ((global as any).__receiveSubmissionCallback) {
      await waitFor(() => {
        (global as any).__receiveSubmissionCallback(newSubmissionAccepted);
      });
    }

    expect(recalculateMemberProblems).toHaveBeenCalledWith(
      initialProblems,
      newSubmissionAccepted,
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(updatedProblems);
    });

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });
});
