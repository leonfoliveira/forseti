import { render, screen, waitFor } from "@testing-library/react";
import { ContestStatus } from "@/app/_util/contest-utils";
import RootEditContestPage from "@/app/root/contests/[id]/page";
import React, { use } from "react";
import { Language } from "@/core/domain/enumerate/Language";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn(),
}));

jest.mock("@/app/_action/find-contest-by-id-for-root-action", () => ({
  useFindContestByIdForRoot: jest.fn(() => ({
    data: { id: 123 },
    isLoading: false,
    act: jest.fn(() =>
      Promise.resolve({
        id: 123,
        title: "Mock Contest",
        languages: [Language.PYTHON_3_13_3],
        startAt: new Date("2025-01-01T00:00:00Z"),
        endAt: new Date("2025-01-02T00:00:00Z"),
        members: [],
        problems: [],
        status: ContestStatus.NOT_STARTED,
      }),
    ),
  })),
}));

jest.mock("@/app/_action/update-contest-action", () => ({
  useUpdateContestAction: jest.fn(() => ({
    isLoading: false,
    act: jest.fn((input) => Promise.resolve(input)),
  })),
}));

jest.mock("@/app/root/contests/_component/contest-form", () => ({
  ContestForm: ({ header }: any) => (
    <div data-testid="contest-form">{header}</div>
  ),
}));

const mockUse = use as jest.Mock;

describe("RootEditContestPage", () => {
  const id = 123;

  const getParams = Promise.resolve({ id });

  beforeEach(async () => {
    mockUse.mockReturnValue({ id });
  });

  it("renders the contest form after fetching contest data", async () => {
    render(<RootEditContestPage params={getParams} />);

    await waitFor(() => {
      expect(screen.getByTestId("contest-form")).toBeInTheDocument();
    });
  });
});
