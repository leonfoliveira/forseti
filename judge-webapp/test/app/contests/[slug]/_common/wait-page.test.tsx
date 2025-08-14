import { render, screen } from "@testing-library/react";

import { WaitPage } from "@/app/contests/[slug]/_common/wait-page";
import { routes } from "@/config/routes";
import { Language } from "@/core/domain/enumerate/Language";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { CountdownClock } from "@/lib/component/countdown-clock";
import { mockRouter } from "@/test/jest.setup";

jest.mock("@/lib/component/countdown-clock", () => ({
  CountdownClock: jest.fn(),
}));

describe("WaitPage", () => {
  it("should render the wait page with correct data", () => {
    const contest = {
      title: "Test Contest",
      startAt: "2023-10-01T00:00:00Z",
      languages: [Language.PYTHON_3_13],
      slug: "test-contest",
    } as unknown as ContestMetadataResponseDTO;

    render(<WaitPage contestMetadata={contest} />);

    expect(screen.getByTestId("title")).toHaveTextContent("Test Contest");
    expect(screen.getByTestId("start-at")).toHaveTextContent("Starts at");
    expect(screen.getByTestId("languages")).toHaveTextContent(
      "Supported languages",
    );
    const languageItems = screen.getAllByTestId("language-item");
    expect(languageItems).toHaveLength(1);
    expect(languageItems[0]).toHaveTextContent("Python 3.13");

    expect(CountdownClock).toHaveBeenCalledWith(
      {
        to: new Date(contest.startAt),
        onZero: expect.any(Function),
      },
      undefined,
    );
    (CountdownClock as jest.Mock).mock.calls[0][0].onZero();
    expect(mockRouter.push).toHaveBeenCalledWith(
      routes.CONTEST_SIGN_IN(contest.slug),
    );
  });
});
