import { render, screen } from "@testing-library/react";
import RootNewContestPage from "@/app/root/contests/new/page";

jest.mock("@/app/_action/create-contest-action", () => ({
  useCreateContestAction: jest.fn(() => ({
    isLoading: false,
    act: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock("@/app/root/contests/_component/contest-form", () => ({
  ContestForm: ({ header }: any) => (
    <div data-testid="contest-form">{header}</div>
  ),
}));

describe("RootNewContestPage", () => {
  it("renders the contest creation form", async () => {
    render(<RootNewContestPage />);

    expect(screen.getByTestId("contest-form")).toBeInTheDocument();
  });
});
