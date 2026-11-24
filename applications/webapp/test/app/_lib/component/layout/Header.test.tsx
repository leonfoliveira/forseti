import { act, fireEvent, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";

import { Header } from "@/app/_lib/component/layout/Header";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";
import {
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: jest.fn(() => ContestStatus.IN_PROGRESS),
}));
jest.mock("@/app/_lib/component/display/badge/ContestStatusBadge", () => ({
  ContestStatusBadge: ({ status }: { status: ContestStatus }) => (
    <span data-testid="contest-status">{status}</span>
  ),
}));
jest.mock("@/app/_lib/component/display/CountdownClock", () => ({
  CountdownClock: () => <span data-testid="countdown-clock">Countdown</span>,
}));

describe("Header", () => {
  it("shows elements when user is authorized and it is not sign-in page", async () => {
    await renderWithProviders(<Header />, {
      contest: MockContestResponseDTO({ title: "Spring contest" }),
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Ada", type: MemberType.CONTESTANT },
      }),
    });

    expect(screen.getByTestId("title")).toHaveTextContent("Spring contest");
    expect(screen.getByTestId("contest-status")).toHaveTextContent(
      ContestStatus.IN_PROGRESS,
    );
    expect(screen.getByTestId("countdown-clock")).toBeInTheDocument();
    expect(screen.getAllByTestId("theme-toggle")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("member-name")[0]).toHaveTextContent("Ada");
    expect(screen.getAllByTestId("member-type")[0]).toHaveTextContent(
      "Contestant",
    );
    expect(screen.queryByTestId("sign-in")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getAllByTestId("sign-out")[0]);
    });

    expect(Composition.sessionWriter.deleteCurrent).toHaveBeenCalled();
  });

  it("hides elements when user is authorized and it is sign-in page", async () => {
    const contest = MockContestResponseDTO({ title: "Spring contest" });
    (useLocation as jest.Mock).mockReturnValueOnce({
      pathname: routes.CONTEST_SIGN_IN(contest.slug),
    });

    await renderWithProviders(<Header />, {
      contest,
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Ada", type: MemberType.CONTESTANT },
      }),
    });

    expect(screen.queryByTestId("member-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("member-type")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sign-out")).not.toBeInTheDocument();
  });

  it("hides countdown clock when contest has ended", async () => {
    (useContestStatusWatcher as jest.Mock).mockReturnValueOnce(
      ContestStatus.ENDED,
    );

    await renderWithProviders(<Header />, {
      contest: MockContestResponseDTO({ title: "Spring contest" }),
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Ada", type: MemberType.CONTESTANT },
      }),
    });

    expect(screen.queryByTestId("countdown-clock")).not.toBeInTheDocument();
  });

  it("shows elements when user is not authorized and it is not sign-in page", async () => {
    const contest = MockContestResponseDTO({ title: "Spring contest" });

    await renderWithProviders(<Header />, {
      contest,
      session: null,
    });

    expect(screen.getByTestId("title")).toHaveTextContent("Spring contest");
    expect(screen.getByTestId("contest-status")).toHaveTextContent(
      ContestStatus.IN_PROGRESS,
    );
    expect(screen.getByTestId("countdown-clock")).toBeInTheDocument();
    expect(screen.getAllByTestId("theme-toggle")[0]).toBeInTheDocument();
    expect(screen.queryByTestId("member-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("member-type")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sign-out")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("sign-in")[0]).toBeInTheDocument();
  });

  it("hides sign-in when user is not authorized and it is sign-in page", async () => {
    const contest = MockContestResponseDTO({ title: "Spring contest" });
    (useLocation as jest.Mock).mockReturnValueOnce({
      pathname: routes.CONTEST_SIGN_IN(contest.slug),
    });

    await renderWithProviders(<Header />, {
      contest,
      session: null,
    });

    expect(screen.queryByTestId("sign-in")).not.toBeInTheDocument();
  });
});
