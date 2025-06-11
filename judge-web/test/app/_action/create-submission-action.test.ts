import { renderHook, waitFor } from "@testing-library/react";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";
import { useCreateSubmissionAction } from "@/app/_action/create-submission-action";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";

jest.mock("@/app/_composition", () => ({
  submissionService: {
    createSubmission: jest.fn(),
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

describe("useCreateSubmissionAction", () => {
  const mockAlertSuccess = jest.fn();
  const mockAlertError = jest.fn();
  const mockSignOutAct = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: mockAlertSuccess,
      error: mockAlertError,
    });
    (useMemberSignOutAction as jest.Mock).mockReturnValue({
      act: mockSignOutAct,
    });
  });

  it("should create a submission successfully and show success alert", async () => {
    const mockSubmission = { id: "test-submission-id" };
    (submissionService.createSubmission as jest.Mock).mockResolvedValue(
      mockSubmission,
    );

    const { result } = renderHook(() => useCreateSubmissionAction());
    const { act: createSubmissionAction } = result.current;

    const contestId = "123";
    const input = {
      code: 'console.log("hello")',
      language: "javascript",
      contestId: contestId,
    } as unknown as CreateSubmissionInputDTO;

    let returnedSubmission: SubmissionFullResponseDTO | undefined;
    await waitFor(async () => {
      returnedSubmission = await createSubmissionAction(contestId, input);
    });

    await waitFor(() => {
      expect(submissionService.createSubmission).toHaveBeenCalledWith(input);
      expect(mockAlertSuccess).toHaveBeenCalled();
      expect(returnedSubmission).toEqual(mockSubmission);
      expect(mockAlertError).not.toHaveBeenCalled();
      expect(mockSignOutAct).not.toHaveBeenCalled();
    });
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new ForbiddenException("Forbidden"),
  ])("should sign out on %s", async (exception) => {
    (submissionService.createSubmission as jest.Mock).mockRejectedValue(
      exception,
    );

    const { result } = renderHook(() => useCreateSubmissionAction());
    const { act: createSubmissionAction } = result.current;

    const contestId = "123";
    const input = {
      code: 'console.log("hello")',
      language: "javascript",
      contestId: contestId,
    } as unknown as CreateSubmissionInputDTO;

    await waitFor(async () => {
      await createSubmissionAction(contestId, input);
    });

    await waitFor(() => {
      expect(submissionService.createSubmission).toHaveBeenCalledWith(input);
      expect(mockSignOutAct).toHaveBeenCalledWith(contestId);
      expect(mockAlertError).not.toHaveBeenCalled();
      expect(mockAlertSuccess).not.toHaveBeenCalled();
    });
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Something went wrong");
    (submissionService.createSubmission as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useCreateSubmissionAction());
    const { act: createSubmissionAction } = result.current;

    const contestId = "123";
    const input = {
      code: 'console.log("hello")',
      language: "javascript",
      contestId: contestId,
    } as unknown as CreateSubmissionInputDTO;

    await waitFor(async () => {
      await createSubmissionAction(contestId, input);
    });

    await waitFor(() => {
      expect(submissionService.createSubmission).toHaveBeenCalledWith(input);
      expect(mockAlertError).toHaveBeenCalled();
      expect(mockAlertSuccess).not.toHaveBeenCalled();
      expect(mockSignOutAct).not.toHaveBeenCalled();
    });
  });
});
