import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useFindFullContestByIdForRoot } from "@/app/_action/find-full-contest-by-id-for-root-action";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  contestService: {
    findFullContestById: jest.fn(),
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

describe("useFindContestByIdForRoot", () => {
  const mockAlertError = jest.fn();
  const mockSignOutAct = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (useRootSignOutAction as jest.Mock).mockReturnValue({
      act: mockSignOutAct,
    });
    (require("next/navigation").redirect as jest.Mock).mockImplementation(
      mockRedirect,
    );
  });

  it("should return contest successfully", async () => {
    const mockContest = { id: 1, name: "Root Contest" };
    (contestService.findFullContestById as jest.Mock).mockResolvedValue(
      mockContest,
    );

    const { result } = renderHook(() => useFindFullContestByIdForRoot());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    let returnedContest;
    await waitFor(async () => {
      returnedContest = await findContestByIdAction(contestId);
    });

    expect(contestService.findFullContestById).toHaveBeenCalledWith(contestId);
    expect(returnedContest).toEqual(mockContest);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
  });

  it("should redirect to /not-found on NotFoundException", async () => {
    (contestService.findFullContestById as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest not found"),
    );

    const { result } = renderHook(() => useFindFullContestByIdForRoot());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";

    await waitFor(async () => {
      await findContestByIdAction(contestId);
    });

    expect(mockRedirect).toHaveBeenCalledWith(`/not-found`);
    expect(contestService.findFullContestById).toHaveBeenCalledWith(contestId);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new ForbiddenException("Forbidden"),
  ])("should sign out on %p", async (exception) => {
    (contestService.findFullContestById as jest.Mock).mockRejectedValue(
      exception,
    );

    const { result } = renderHook(() => useFindFullContestByIdForRoot());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    await waitFor(async () => {
      await findContestByIdAction(contestId);
    });

    expect(contestService.findFullContestById).toHaveBeenCalledWith(contestId);
    expect(mockSignOutAct).toHaveBeenCalledTimes(1);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network Error");
    (contestService.findFullContestById as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useFindFullContestByIdForRoot());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    let returnedContest;
    await waitFor(async () => {
      returnedContest = await findContestByIdAction(contestId);
    });

    expect(contestService.findFullContestById).toHaveBeenCalledWith(contestId);
    expect(returnedContest).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
