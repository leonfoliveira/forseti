import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useUpdateContestAction } from "@/app/_action/update-contest-action";
import { validateTestCases } from "@/app/_util/test-cases-validator";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  contestService: {
    updateContest: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("@/app/_action/root-sign-out-action", () => ({
  useRootSignOutAction: jest.fn(() => ({
    act: jest.fn(),
  })),
}));

jest.mock("@/app/_util/test-cases-validator", () => ({
  validateTestCases: jest.fn(() => Promise.resolve(true)),
}));

describe("useUpdateContestAction", () => {
  const mockAlertSuccess = jest.fn();
  const mockAlertError = jest.fn();
  const mockAlertWarning = jest.fn();
  const mockSignOutAct = jest.fn();
  const mockRedirect = jest.fn();
  let mockValidateTestCases = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: mockAlertSuccess,
      error: mockAlertError,
      warning: mockAlertWarning,
    });
    (useRootSignOutAction as jest.Mock).mockReturnValue({
      act: mockSignOutAct,
    });
    (require("next/navigation").redirect as jest.Mock).mockImplementation(
      mockRedirect,
    );
    mockValidateTestCases = (validateTestCases as jest.Mock).mockResolvedValue(
      true,
    );
  });

  it("should validate test cases before creating a contest", async () => {
    mockValidateTestCases.mockResolvedValue(false);

    const { result } = renderHook(() => useUpdateContestAction());
    const { act: updateContestAction } = result.current;

    const input: UpdateContestInputDTO = {
      id: 1,
      name: "New Contest Name",
      description: "New description",
      startDate: new Date(),
      endDate: new Date(),
      problems: [{ testCases: {} }],
    } as unknown as UpdateContestInputDTO;

    await waitFor(async () => {
      await updateContestAction(input);
    });

    expect(contestService.updateContest).not.toHaveBeenCalled();
    expect(mockAlertWarning).toHaveBeenCalled();
  });

  it("should update a contest successfully", async () => {
    const mockContest = { id: 1, name: "Updated Contest" };
    (contestService.updateContest as jest.Mock).mockResolvedValue(mockContest);

    const { result } = renderHook(() => useUpdateContestAction());
    const { act: updateContestAction } = result.current;

    const input: UpdateContestInputDTO = {
      id: 1,
      name: "New Contest Name",
      description: "New description",
      startDate: new Date(),
      endDate: new Date(),
      problems: [{ newTestCases: {} }],
    } as unknown as UpdateContestInputDTO;

    let returnedContest;
    await waitFor(async () => {
      returnedContest = await updateContestAction(input);
    });

    expect(contestService.updateContest).toHaveBeenCalledWith(input);
    expect(mockAlertSuccess).toHaveBeenCalled();
    expect(returnedContest).toEqual(mockContest);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(validateTestCases).toHaveBeenCalledWith(
      input.problems[0].newTestCases,
    );
  });

  it("should redirect to /not-found on NotFoundException", async () => {
    (contestService.updateContest as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest not found"),
    );

    const { result } = renderHook(() => useUpdateContestAction());
    const { act: updateContestAction } = result.current;

    const input: UpdateContestInputDTO = {
      id: 1,
      name: "New Contest Name",
      description: "New description",
      startDate: new Date(),
      endDate: new Date(),
      problems: [],
    } as unknown as UpdateContestInputDTO;

    await waitFor(async () => {
      await updateContestAction(input);
    });

    expect(mockRedirect).toHaveBeenCalledWith(`/not-found`);
    expect(contestService.updateContest).toHaveBeenCalledWith(input);
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new ForbiddenException("Forbidden"),
  ])("should sign out on %p", async (exception) => {
    (contestService.updateContest as jest.Mock).mockRejectedValue(exception);

    const { result } = renderHook(() => useUpdateContestAction());
    const { act: updateContestAction } = result.current;

    const input: UpdateContestInputDTO = {
      id: 1,
      name: "New Contest Name",
      description: "New description",
      startDate: new Date(),
      endDate: new Date(),
      problems: [],
    } as unknown as UpdateContestInputDTO;

    await waitFor(async () => {
      await updateContestAction(input);
    });

    expect(contestService.updateContest).toHaveBeenCalledWith(input);
    expect(mockSignOutAct).toHaveBeenCalledTimes(1);
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Something went wrong");
    (contestService.updateContest as jest.Mock).mockRejectedValue(genericError);

    const { result } = renderHook(() => useUpdateContestAction());
    const { act: updateContestAction } = result.current;

    const input: UpdateContestInputDTO = {
      id: 1,
      name: "New Contest Name",
      description: "New description",
      startDate: new Date(),
      endDate: new Date(),
      problems: [],
    } as unknown as UpdateContestInputDTO;

    let returnedContest;
    await waitFor(async () => {
      returnedContest = await updateContestAction(input);
    });

    expect(contestService.updateContest).toHaveBeenCalledWith(input);
    expect(returnedContest).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalled();
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
