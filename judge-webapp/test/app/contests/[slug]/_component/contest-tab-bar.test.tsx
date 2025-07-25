import { ContestTabBar } from "@/app/contests/[slug]/_component/contest-tab-bar";
import { fireEvent, render, screen } from "@testing-library/react";
import { mockRouter, mockUsePathname } from "@/test/jest.setup";

describe("ContestTabBar", () => {
  it("should render tabs with correct labels and paths", () => {
    mockUsePathname.mockReturnValueOnce("/contests/contest-slug/overview");

    const tabs = [
      { label: "Overview", path: "/contests/contest-slug/overview" },
      { label: "Problems", path: "/contests/contest-slug/problems" },
    ];

    render(<ContestTabBar tabs={tabs} />);

    const tabElements = screen.getAllByTestId("tab");

    expect(tabElements[0]).toHaveClass("tab-active");
    expect(tabElements[0]).toHaveTextContent("Overview");
    fireEvent.click(tabElements[0]);
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/contests/contest-slug/overview",
    );

    expect(tabElements[1]).not.toHaveClass("tab-active");
    expect(tabElements[1]).toHaveTextContent("Problems");
    fireEvent.click(tabElements[1]);
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/contests/contest-slug/problems",
    );
  });
});
