import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useFindAllContestsAction } from "@/app/_action/find-all-contests-action";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findAllContests: jest.fn(),
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

describe("useFindAllContestsAction", () => {
  const mockAlertError = jest.fn();
  const mockSignOutAct = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(), // Not used in this hook's success path
      error: mockAlertError,
    });
    (useRootSignOutAction as jest.Mock).mockReturnValue({
      act: mockSignOutAct,
    });
  });

  it("should return contests successfully", async () => {
    const mockContests = [{ id: "c1" }, { id: "c2" }];
    (contestService.findAllContests as jest.Mock).mockResolvedValue(
      mockContests,
    );

    const { result } = renderHook(() => useFindAllContestsAction());
    const { act: findAllContestsAction } = result.current;

    let returnedContests;
    await waitFor(async () => {
      returnedContests = await findAllContestsAction();
    });

    expect(contestService.findAllContests).toHaveBeenCalledTimes(1);
    expect(returnedContests).toEqual(mockContests);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new NotFoundException("Not Found"),
  ])("should sign out on %p", async (exception) => {
    (contestService.findAllContests as jest.Mock).mockRejectedValue(exception);

    const { result } = renderHook(() => useFindAllContestsAction());
    const { act: findAllContestsAction } = result.current;

    await waitFor(async () => {
      await findAllContestsAction();
    });

    expect(contestService.findAllContests).toHaveBeenCalledTimes(1);
    expect(mockSignOutAct).toHaveBeenCalledTimes(1);
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network Error");
    (contestService.findAllContests as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useFindAllContestsAction());
    const { act: findAllContestsAction } = result.current;

    await waitFor(async () => {
      await findAllContestsAction();
    });

    expect(contestService.findAllContests).toHaveBeenCalledTimes(1);
    expect(mockAlertError).toHaveBeenCalledWith("Error loading contests");
    expect(mockSignOutAct).not.toHaveBeenCalled();
  });
});
