import { act, render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";

import { ContestLayout } from "@/app/[slug]/ContestLayout";
import { Composition } from "@/config/composition";
import {
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";

jest.mock("@/app/_lib/component/layout/Footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));
jest.mock("@/app/_lib/component/layout/Header", () => ({
  Header: () => <header data-testid="header" />,
}));
jest.mock("@/app/_lib/component/page/LoadingPage", () => ({
  LoadingPage: () => <p data-testid="loading" />,
}));
jest.mock("@/app/_lib/component/page/ErrorPage", () => ({
  ErrorPage: () => <p data-testid="error" />,
}));
jest.mock("@/app/_lib/store/StoreProvider", () => ({
  StoreProvider: ({
    children,
    preloadedState,
  }: {
    children: React.ReactNode;
    preloadedState: unknown;
  }) => (
    <div data-testid="store" data-loaded={JSON.stringify(preloadedState)}>
      {children}
    </div>
  ),
}));

describe("ContestLayout", () => {
  it("loads contest and session data and renders the shared layout", async () => {
    jest
      .mocked(useLocation)
      .mockReturnValue({ pathname: "/spring/leaderboard" } as never);
    jest
      .mocked(Composition.sessionReader.getCurrent)
      .mockResolvedValue(MockSessionResponseDTO());
    jest
      .mocked(Composition.contestReader.findBySlug)
      .mockResolvedValue(MockContestResponseDTO({ slug: "spring" }));

    await act(async () => render(<ContestLayout />));
    expect(Composition.contestReader.findBySlug).toHaveBeenCalledWith("spring");
    expect(screen.getByTestId("store")).toHaveAttribute(
      "data-loaded",
      expect.stringContaining('"slug":"spring"'),
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
