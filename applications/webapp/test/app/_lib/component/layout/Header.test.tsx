import { screen } from "@testing-library/react";

import { Header } from "@/app/_lib/component/layout/Header";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockContestResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: () => ContestStatus.IN_PROGRESS,
}));
jest.mock("@/app/_lib/component/display/badge/ContestStatusBadge", () => ({
  ContestStatusBadge: ({ status }: { status: ContestStatus }) => <span data-testid="contest-status">{status}</span>,
}));
jest.mock("@/app/_lib/component/display/CountdownClock", () => ({
  CountdownClock: () => <span data-testid="countdown-clock">Countdown</span>,
}));

describe("Header", () => {
  it("shows contest, user, theme action, status and countdown", async () => {
    await renderWithProviders(<Header />, {
      contest: MockContestResponseDTO({ title: "Spring contest" }),
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Ada", type: MemberType.CONTESTANT },
      }),
    });
    expect(screen.getByTestId("title")).toHaveTextContent("Spring contest");
    expect(screen.getAllByTestId("member-name")[0]).toHaveTextContent("Ada");
    expect(screen.getByTestId("contest-status")).toHaveTextContent(ContestStatus.IN_PROGRESS);
    expect(screen.getByTestId("countdown-clock")).toBeInTheDocument();
  });
});
