import { renderHook, waitFor } from "@testing-library/react";

import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { useRouter } from "next/navigation";
import { useCreateContestAction } from "@/app/_action/create-contest-action";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { validateTestCases } from "@/app/_util/test-cases-validator";

jest.mock("@/app/_composition", () => ({
  contestService: {
    createContest: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
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

jest.mock("@/app/_util/test-cases-validator", () => ({
  validateTestCases: jest.fn(() => Promise.resolve(true)),
}));

describe("useCreateContestAction", () => {
  const mockAlertSuccess = jest.fn();
  const mockAlertError = jest.fn();
  const mockAlertWarning = jest.fn();
  const mockSignOutAct = jest.fn();
  const mockRouterPush = jest.fn();
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
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    mockValidateTestCases = (validateTestCases as jest.Mock).mockResolvedValue(
      true,
    );
  });

  it("should validate test cases before creating a contest", async () => {
    mockValidateTestCases.mockResolvedValue(false);

    const { result } = renderHook(() => useCreateContestAction());
    const { act: createContestAction } = result.current;

    const input = {
      name: "Test Contest",
      description: "A contest for testing",
      startDate: new Date(),
      endDate: new Date(),
      problems: [
        {
          newTestCases: {},
        },
      ],
    } as unknown as CreateContestInputDTO;

    await waitFor(async () => {
      await createContestAction(input);
    });

    expect(contestService.createContest).not.toHaveBeenCalled();
    expect(mockAlertWarning).toHaveBeenCalled();
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
      problems: [
        {
          newTestCases: {},
        },
      ],
    } as unknown as CreateContestInputDTO;

    await waitFor(async () => {
      await createContestAction(input);
    });

    expect(contestService.createContest).toHaveBeenCalledWith(input);
    expect(mockAlertSuccess).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/root/contests/${mockContest.id}`,
    );
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(mockValidateTestCases).toHaveBeenCalledWith(
      input.problems[0].newTestCases,
    );
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
      problems: [],
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
      problems: [],
    } as unknown as CreateContestInputDTO;

    await waitFor(async () => {
      await createContestAction(input);
    });

    expect(contestService.createContest).toHaveBeenCalledWith(input);
    expect(mockAlertError).toHaveBeenCalled();
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockSignOutAct).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
