import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useDeleteContestAction } from "@/app/_action/delete-contest-action";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  contestService: {
    deleteContest: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("useDeleteContestAction", () => {
  const mockAlertSuccess = jest.fn();
  const mockAlertError = jest.fn();
  const mockRouterPush = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlert as jest.Mock).mockReturnValue({
      success: mockAlertSuccess,
      error: mockAlertError,
    });
    (require("next/navigation").useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    (require("next/navigation").redirect as jest.Mock).mockImplementation(
      mockRedirect,
    );
  });

  it("should delete a contest successfully and navigate", async () => {
    (contestService.deleteContest as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteContestAction());
    const { act: deleteContestAction } = result.current;

    const contestId = "123";

    await waitFor(async () => {
      await deleteContestAction(contestId);
    });

    expect(contestService.deleteContest).toHaveBeenCalledWith(contestId);
    expect(mockAlertSuccess).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/root/contests");
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should redirect to /not-found on NotFoundException", async () => {
    (contestService.deleteContest as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest not found"),
    );

    const { result } = renderHook(() => useDeleteContestAction());
    const { act: deleteContestAction } = result.current;

    const contestId = "123";

    await waitFor(async () => {
      await deleteContestAction(contestId);
    });

    expect(mockRedirect).toHaveBeenCalledWith(`/not-found`);
    expect(contestService.deleteContest).toHaveBeenCalledWith(contestId);
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Something went wrong");
    (contestService.deleteContest as jest.Mock).mockRejectedValue(genericError);

    const { result } = renderHook(() => useDeleteContestAction());
    const { act: deleteContestAction } = result.current;

    const contestId = "123";

    await waitFor(async () => {
      await deleteContestAction(contestId);
    });

    expect(contestService.deleteContest).toHaveBeenCalledWith(contestId);
    expect(mockAlertError).toHaveBeenCalled();
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
