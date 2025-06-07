import { renderHook, waitFor } from "@testing-library/react";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useFindContestMetadataByIdAction } from "@/app/_action/find-contest-metadata-action";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/_composition", () => ({
  contestService: {
    findContestMetadataById: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("useFindContestMetadataByIdAction", () => {
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

  it("should return contest summary successfully", async () => {
    const mockContestSummary = {
      id: 1,
      name: "Test Contest Summary",
      totalProblems: 5,
    };
    (contestService.findContestMetadataById as jest.Mock).mockResolvedValue(
      mockContestSummary,
    );

    const { result } = renderHook(() => useFindContestMetadataByIdAction());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    let returnedContestSummary;
    await waitFor(async () => {
      returnedContestSummary = await findContestByIdAction(contestId);
    });

    expect(contestService.findContestMetadataById).toHaveBeenCalledWith(
      contestId,
    );
    expect(returnedContestSummary).toEqual(mockContestSummary);
    expect(mockAlertError).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should redirect to /not-found on NotFoundException", async () => {
    (contestService.findContestMetadataById as jest.Mock).mockRejectedValue(
      new NotFoundException("Contest summary not found"),
    );

    const { result } = renderHook(() => useFindContestMetadataByIdAction());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";

    await waitFor(async () => {
      await findContestByIdAction(contestId);
    });

    expect(mockRedirect).toHaveBeenCalledWith(`/not-found`);
    expect(contestService.findContestMetadataById).toHaveBeenCalledWith(
      contestId,
    );
    expect(mockAlertError).not.toHaveBeenCalled();
  });

  it("should show an error alert for other exceptions", async () => {
    const genericError = new Error("Something went wrong");
    (contestService.findContestMetadataById as jest.Mock).mockRejectedValue(
      genericError,
    );

    const { result } = renderHook(() => useFindContestMetadataByIdAction());
    const { act: findContestByIdAction } = result.current;

    const contestId = "123";
    let returnedContestSummary;
    await waitFor(async () => {
      returnedContestSummary = await findContestByIdAction(contestId);
    });

    expect(contestService.findContestMetadataById).toHaveBeenCalledWith(
      contestId,
    );
    expect(returnedContestSummary).toBeUndefined();
    expect(mockAlertError).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
