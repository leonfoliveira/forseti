import { render, screen, fireEvent } from "@testing-library/react";
import RootContestsPage from "@/app/root/contests/page";
import { useRouter } from "next/navigation";
import { useFindAllContestsMetadataAction } from "@/app/_action/find-all-contests-metadata-action";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/_action/find-all-contests-metadata-action", () => ({
  useFindAllContestsAction: jest.fn(),
}));

jest.mock("@/app/_component/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock("@/app/root/contests/_component/contests-table", () => ({
  ContestsTable: ({ contests }: { contests: any[] }) => (
    <div data-testid="contests-table">{`Contests: ${contests.length}`}</div>
  ),
}));

describe("RootContestsPage", () => {
  const mockAct = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (useFindAllContestsMetadataAction as jest.Mock).mockReturnValue({
      isLoading: false,
      data: [{ id: 1, title: "Contest A" }],
      act: mockAct,
    });
  });

  it("calls findAllContestsAction.act on mount", () => {
    render(<RootContestsPage />);
    expect(mockAct).toHaveBeenCalled();
  });

  it("renders the contests table with data", () => {
    render(<RootContestsPage />);
    expect(screen.getByTestId("contests-table")).toHaveTextContent(
      "Contests: 1",
    );
  });

  it("shows spinner when loading", () => {
    (useFindAllContestsMetadataAction as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
      act: mockAct,
    });

    render(<RootContestsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("navigates to new contest page on button click", () => {
    render(<RootContestsPage />);
    fireEvent.click(screen.getByTestId("new"));
    expect(mockPush).toHaveBeenCalledWith("/root/contests/new");
  });
});
