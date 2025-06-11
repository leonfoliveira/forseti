import React from "react";
import { useAuthorization } from "@/app/_context";
import { render, screen } from "@testing-library/react";
import { DefaultContestProblemsPage } from "@/app/contests/[id]/problems/_default-page";
import { ContestantContestProblemsPage } from "@/app/contests/[id]/problems/_contestant-page";
import { MemberType } from "@/core/domain/enumerate/MemberType";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_util/authorization-hook", () => ({
  useAuthorization: jest.fn(),
}));

jest.mock("@/app/contests/[id]/problems/_contestant-page", () => ({
  ContestantContestProblemsPage: jest.fn(() => (
    <div data-testid="contest-page">Contestant Page</div>
  )),
}));

jest.mock("@/app/contests/[id]/problems/_default-page", () => ({
  DefaultContestProblemsPage: jest.fn(() => (
    <div data-testid="default-page">Default Page</div>
  )),
}));

const mockUse = React.use as jest.Mock;
const mockUseAuthorization = useAuthorization as jest.Mock;

describe("ContestProblemsPage", () => {
  const contestId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUse.mockReturnValue({ id: contestId });
    mockUseAuthorization.mockReturnValue(null);
  });

  it("renders DefaultContestProblemsPage for non-contestant", () => {
    render(<DefaultContestProblemsPage contestId={contestId} />);
    expect(screen.getByTestId("default-page")).toBeInTheDocument();
  });

  it("renders ContestantContestProblemsPage for contestant", () => {
    mockUseAuthorization.mockReturnValue({
      member: { type: MemberType.CONTESTANT },
    });
    render(<ContestantContestProblemsPage contestId={contestId} />);
    expect(screen.getByTestId("contest-page")).toBeInTheDocument();
  });
});
