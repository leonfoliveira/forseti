import { render, screen } from "@testing-library/react";
import { ContestStatusBadge } from "@/app/root/contests/_component/contest-status-badge";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

describe("ContestStatusBadge", () => {
  it("renders with badge-success for IN_PROGRESS status", () => {
    const contest = {
      status: ContestStatus.IN_PROGRESS,
    };
    render(<ContestStatusBadge contest={contest} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("badge-success");
  });

  it("renders with badge-warning for ENDED status", () => {
    const contest = {
      status: ContestStatus.ENDED,
    };
    render(<ContestStatusBadge contest={contest} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("badge-warning");
  });

  it("renders with badge-neutral for default status (e.g., UPCOMING)", () => {
    const contest = {
      status: ContestStatus.NOT_STARTED,
    };
    render(<ContestStatusBadge contest={contest} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("badge-neutral");
  });
});
