import { renderHook, waitFor } from "@testing-library/react";

import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { useRouter } from "next/navigation";
import { useCreateContestAction } from "@/app/_action/create-contest-action";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";

jest.mock("@/app/_composition", () => ({
  contestService: {
    createContest: jest.fn(),
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

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("useCreateContestAction", () => {
  const mockAlertSuccess = jest.fn();
  const mockAlertError = jest.fn();
  const mockSignOutAct = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: mockAlertSuccess,
      error: mockAlertError,
    });
    (useRootSignOutAction as jest.Mock).mockReturnValue({
      act: mockSignOutAct,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
  });

  it("should create a contest successfully and navigate", async () => {
    const mockContest = { id: "test-contest-id" };
    (contestService.createContest as jest.Mock).mockResolvedValue(mockContest);

    const { result } = renderHook(() => useCreateContestAction());
    const { act: createContestAction } = result.current;

    const input = {
      name: "Test Contest",
      description: "A contest for testing",
      startDate: new Date(),
      endDate: new Date(),
    } as unknown as CreateContestInputDTO;

    await waitFor(async () => {
      await createContestAction(input);
    });

    expect(contestService.createContest).toHaveBeenCalledWith(input);
    expect(mockAlertSuccess).toHaveBeenCalledWith(
      "Contest created successfully",
    );
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/root/contests/${mockContest.id}`,
    );
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
  });

  it.each([
    new UnauthorizedException("Unauthorized"),
    new ForbiddenException("Forbidden"),
  ])("should sign out on %s", async (exception) => {
    (contestService.createContest as jest.Mock).mockRejectedValue(exception);

    const { result } = renderHook(() => useCreateContestAction());
    const { act: createContestAction } = result.current;

    const input = {
      name: "Test Contest",
      description: "A contest for testing",
      startDate: new Date(),
      endDate: new Date(),
    } as unknown as CreateContestInputDTO;

    await waitFor(async () => {
      await createContestAction(input);
    });

    expect(contestService.createContest).toHaveBeenCalledWith(input);
    expect(mockSignOutAct).toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Something went wrong");
    (contestService.createContest as jest.Mock).mockRejectedValue(genericError);

    const { result } = renderHook(() => useCreateContestAction());
    const { act: createContestAction } = result.current;

    const input = {
      name: "Test Contest",
      description: "A contest for testing",
      startDate: new Date(),
      endDate: new Date(),
    } as unknown as CreateContestInputDTO;

    await waitFor(async () => {
      await createContestAction(input);
    });

    expect(contestService.createContest).toHaveBeenCalledWith(input);
    expect(mockAlertError).toHaveBeenCalledWith("Error creating contest");
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
