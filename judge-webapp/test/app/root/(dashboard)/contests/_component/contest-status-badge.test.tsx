import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { render, screen } from "@testing-library/react";
import { ContestStatusBadge } from "@/app/root/(dashboard)/contests/_component/contest-status-badge";
import { useContestStatusWatcher } from "@/app/_util/contest-status-watcher";

jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: () => ({
    formatStatus: jest.fn((status) => status),
  }),
}));

jest.mock("@/app/_util/contest-status-watcher", () => ({
  useContestStatusWatcher: jest.fn(),
}));

jest.mock("@/app/_component/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

describe("ContestStatusBadge", () => {
  it.each([
    [ContestStatus.IN_PROGRESS, "badge-success"],
    [ContestStatus.ENDED, "badge-warning"],
    [ContestStatus.NOT_STARTED, "badge-neutral"],
  ])("render each status correctly", (status, expectedClassName) => {
    (useContestStatusWatcher as jest.Mock).mockReturnValueOnce(status);

    render(<ContestStatusBadge contest={{} as any} />);

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass(expectedClassName);
    expect(badge).toHaveTextContent(status);
  });
});
