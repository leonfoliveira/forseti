import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  contestService: {
    findContestById: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("useFindContestByIdAction", () => {
  const mockAlertError = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockAlertError,
    });
    (require("next/navigation").redirect as jest.Mock).mockImplementation(
      mockRedirect,
    );
  });

  it("should return contest successfully", async () => {
    const mockContest = { id: 1, name: "Test Contest" };
    (contestService.findContestById as jest.Mock).mockResolvedValue(
      mockContest,
    );

    const { result } = renderHook(() => useFindContestByIdAction());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    let returnedContest;
    await waitFor(async () => {
      returnedContest = await findContestByIdAction(contestId);
    });

    expect(contestService.findContestById).toHaveBeenCalledWith(contestId);
    expect(returnedContest).toEqual(mockContest);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should redirect to /not-found on NotFoundException", async () => {
    (contestService.findContestById as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest not found"),
    );

    const { result } = renderHook(() => useFindContestByIdAction());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";

    await waitFor(async () => {
      await findContestByIdAction(contestId);
    });

    expect(mockRedirect).toHaveBeenCalledWith(`/not-found`);
    expect(contestService.findContestById).toHaveBeenCalledWith(contestId);
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Network Error");
    (contestService.findContestById as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useFindContestByIdAction());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    let returnedContest;
    await waitFor(async () => {
      returnedContest = await findContestByIdAction(contestId);
    });

    expect(contestService.findContestById).toHaveBeenCalledWith(contestId);
    expect(returnedContest).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
