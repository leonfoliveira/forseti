import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useUpdateContestAction } from "@/app/_action/update-contest-action";

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

describe("useUpdateContestAction", () => {
  const mockAlertSuccess = jest.fn();
  const mockAlertError = jest.fn();
  const mockSignOutAct = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: mockAlertSuccess,
      error: mockAlertError,
    });
    (useRootSignOutAction as jest.Mock).mockReturnValue({
      act: mockSignOutAct,
    });
    (require("next/navigation").redirect as jest.Mock).mockImplementation(
      mockRedirect,
    );
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
    } as unknown as UpdateContestInputDTO;

    let returnedContest;
    await waitFor(async () => {
      returnedContest = await updateContestAction(input);
    });

    expect(contestService.updateContest).toHaveBeenCalledWith(input);
    expect(mockAlertSuccess).toHaveBeenCalledWith(
      "Contest updated successfully",
    );
    expect(returnedContest).toEqual(mockContest);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
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
    } as unknown as UpdateContestInputDTO;

    let returnedContest;
    await waitFor(async () => {
      returnedContest = await updateContestAction(input);
    });

    expect(contestService.updateContest).toHaveBeenCalledWith(input);
    expect(returnedContest).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalledWith("Error updating contest");
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
