import { renderHook, waitFor } from "@testing-library/react";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useFindAllProblemsAction } from "@/app/_action/find-all-problems-action";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findAllProblems: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("useFindAllProblemsAction", () => {
  const mockAlertError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
  });

  it("should return problems successfully", async () => {
    const mockProblems = [{ id: "p1" }, { id: "p2" }];
    (contestService.findAllProblems as jest.Mock).mockResolvedValue(
      mockProblems,
    );

    const { result } = renderHook(() => useFindAllProblemsAction());
    const { act: findAllProblemsAction } = result.current;

    const contestId = 123;
    let returnedProblems;
    await waitFor(async () => {
      returnedProblems = await findAllProblemsAction(contestId);
    });

    expect(contestService.findAllProblems).toHaveBeenCalledWith(contestId);
    expect(returnedProblems).toEqual(mockProblems);
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show an error alert when an error occurs", async () => {
    (contestService.findAllProblems as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useFindAllProblemsAction());
    const { act: findAllProblemsAction } = result.current;

    const contestId = 123;
    let returnedProblems;
    await waitFor(async () => {
      returnedProblems = await findAllProblemsAction(contestId);
    });

    expect(contestService.findAllProblems).toHaveBeenCalledWith(contestId);
    expect(returnedProblems).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalledWith("Error loading problems");
  });
});
