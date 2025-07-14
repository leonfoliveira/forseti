import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { contestService } from "@/app/_composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { alert, redirect, router } from "@/test/jest.setup";

jest.mock("@/app/_composition", () => ({
  contestService: {
    findContestMetadataBySlug: jest.fn(),
  },
}));

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render warn when logging to a contest not found", async () => {
    (
      contestService.findContestMetadataBySlug as jest.Mock
    ).mockRejectedValueOnce(new NotFoundException(""));

    render(<HomePage />);

    fireEvent.change(screen.getByTestId("slug:input"), {
      target: { value: "non-existent-contest" },
    });
    fireEvent.click(screen.getByTestId("join"));

    await waitFor(() => {
      expect(alert.warning).toHaveBeenCalledWith("not-found");
    });
  });

  it("should render error when logging to a contest with an error", async () => {
    (
      contestService.findContestMetadataBySlug as jest.Mock
    ).mockRejectedValueOnce(new Error("Unexpected error"));

    render(<HomePage />);

    fireEvent.change(screen.getByTestId("slug:input"), {
      target: { value: "error-contest" },
    });
    fireEvent.click(screen.getByTestId("join"));

    await waitFor(() => {
      expect(alert.error).toHaveBeenCalledWith("error");
    });
  });

  it("should redirect to contest sign-in page on successful join", async () => {
    (
      contestService.findContestMetadataBySlug as jest.Mock
    ).mockResolvedValueOnce({ slug: "test-contest" });

    render(<HomePage />);

    fireEvent.change(screen.getByTestId("slug:input"), {
      target: { value: "test-contest" },
    });
    fireEvent.click(screen.getByTestId("join"));

    await waitFor(() => {
      expect(contestService.findContestMetadataBySlug).toHaveBeenCalledWith(
        "test-contest",
      );
      expect(router.push).toHaveBeenCalledWith(
        "/contests/test-contest/sign-in",
      );
    });
  });

  it("should redirect to root sign-in page", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByTestId("root"));

    expect(redirect).toHaveBeenCalledWith("/root/sign-in", "push");
  });
});
