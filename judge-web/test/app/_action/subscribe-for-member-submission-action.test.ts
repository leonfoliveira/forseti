import { renderHook, waitFor } from "@testing-library/react";
import { submissionService } from "@/app/_composition";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useToast } from "@/app/_component/toast/toast-provider";
import { useSubscribeForMemberSubmissionAction } from "@/app/_action/subscribe-for-member-submission-action";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

jest.mock("@/app/_composition", () => ({
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

jest.mock("@/app/_component/toast/toast-provider", () => ({
  useToast: jest.fn(() => ({
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: jest.fn(() => ({
    formatSubmissionStatus: jest.fn((status) => `Mocked: ${status}`),
  })),
}));

describe("useSubscribeForMemberSubmissionAction", () => {
  const mockAlertError = jest.fn();
  const mockToastInfo = jest.fn();
  const mockToastWarning = jest.fn();
  const mockToastError = jest.fn();
  const mockSubscribeForMember = jest.fn();
  const mockUnsubscribe = jest.fn();
  const mockFormatSubmissionStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (useToast as jest.Mock).mockReturnValue({
      info: mockToastInfo,
      warning: mockToastWarning,
      error: mockToastError,
    });
    (submissionService.subscribeForMember as jest.Mock).mockImplementation(
      mockSubscribeForMember,
    );
    (submissionService.unsubscribe as jest.Mock).mockImplementation(
      mockUnsubscribe,
    );
    (useContestFormatter as jest.Mock).mockReturnValue({
      formatSubmissionStatus: mockFormatSubmissionStatus,
    });
  });

  it("should subscribe for member submissions successfully", async () => {
    const mockStompClient = { id: "stompClient1" };
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result, unmount } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    expect(submissionService.subscribeForMember).toHaveBeenCalledWith(
      memberId,
      expect.any(Function),
    );
    expect(mockAlertError).not.toHaveBeenCalled();

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(mockStompClient);
  });

  it("should show an error alert when subscription fails", async () => {
    mockSubscribeForMember.mockRejectedValue(new Error("Subscription failed"));

    const { result } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    expect(submissionService.subscribeForMember).toHaveBeenCalledWith(
      memberId,
      expect.any(Function),
    );
    expect(mockAlertError).toHaveBeenCalledWith(
      "Error subscribing to submissions",
    );
  });

  it("should not show toast for JUDGING status", async () => {
    const mockStompClient = { id: "stompClient1" };
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    const receiveSubmissionCallback = mockSubscribeForMember.mock.calls[0][1];
    const submission: SubmissionPublicResponseDTO = {
      id: "s1",
      status: SubmissionStatus.JUDGING,
    } as unknown as SubmissionPublicResponseDTO;

    await waitFor(() => {
      receiveSubmissionCallback(submission);
    });

    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockToastWarning).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("should show info toast for TIME_LIMIT_EXCEEDED status", async () => {
    const mockStompClient = { id: "stompClient1" };
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    const receiveSubmissionCallback = mockSubscribeForMember.mock.calls[0][1];
    const submission: SubmissionPublicResponseDTO = {
      id: "s1",
      status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
    } as unknown as SubmissionPublicResponseDTO;

    await waitFor(() => {
      receiveSubmissionCallback(submission);
    });

    expect(mockFormatSubmissionStatus).toHaveBeenCalledWith(
      SubmissionStatus.TIME_LIMIT_EXCEEDED,
    );
    expect(mockToastInfo).toHaveBeenCalled();
    expect(mockToastWarning).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("should show warning toast for COMPILATION_ERROR status", async () => {
    const mockStompClient = { id: "stompClient1" };
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    const receiveSubmissionCallback = mockSubscribeForMember.mock.calls[0][1];
    const submission: SubmissionPublicResponseDTO = {
      id: "s1",
      status: SubmissionStatus.COMPILATION_ERROR,
    } as unknown as SubmissionPublicResponseDTO;

    await waitFor(() => {
      receiveSubmissionCallback(submission);
    });

    expect(mockFormatSubmissionStatus).toHaveBeenCalledWith(
      SubmissionStatus.COMPILATION_ERROR,
    );
    expect(mockToastWarning).toHaveBeenCalled();
    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("should show warning toast for RUNTIME_ERROR status", async () => {
    const mockStompClient = { id: "stompClient1" };
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    const receiveSubmissionCallback = mockSubscribeForMember.mock.calls[0][1];
    const submission: SubmissionPublicResponseDTO = {
      id: "s1",
      status: SubmissionStatus.RUNTIME_ERROR,
    } as unknown as SubmissionPublicResponseDTO;

    await waitFor(() => {
      receiveSubmissionCallback(submission);
    });

    expect(mockFormatSubmissionStatus).toHaveBeenCalledWith(
      SubmissionStatus.RUNTIME_ERROR,
    );
    expect(mockToastWarning).toHaveBeenCalled();
    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("should show error toast for WRONG_ANSWER status", async () => {
    const mockStompClient = { id: "stompClient1" };
    mockSubscribeForMember.mockResolvedValue(mockStompClient);

    const { result } = renderHook(() =>
      useSubscribeForMemberSubmissionAction(),
    );
    const { act: subscribeAction } = result.current;

    const memberId = 123;
    await waitFor(async () => {
      await subscribeAction(memberId);
    });

    const receiveSubmissionCallback = mockSubscribeForMember.mock.calls[0][1];
    const submission: SubmissionPublicResponseDTO = {
      id: "s1",
      status: SubmissionStatus.WRONG_ANSWER,
    } as unknown as SubmissionPublicResponseDTO;

    await waitFor(() => {
      receiveSubmissionCallback(submission);
    });

    expect(mockFormatSubmissionStatus).toHaveBeenCalledWith(
      SubmissionStatus.WRONG_ANSWER,
    );
    expect(mockToastError).toHaveBeenCalled();
    expect(mockToastInfo).not.toHaveBeenCalled();
    expect(mockToastWarning).not.toHaveBeenCalled();
  });
});
