import { fireEvent, render, screen } from "@testing-library/react";
import { RedirectType } from "next/navigation";

import { RootTabBar } from "@/app/root/(dashboard)/_component/root-tab-bar";
import { mockRedirect, mockUsePathname } from "@/test/jest.setup";

describe("RootTabBar", () => {
  it("renders with all links", () => {
    mockUsePathname.mockReturnValue("/root/contests");

    render(<RootTabBar />);

    const link0 = screen.getByTestId("link:/root/contests");
    expect(link0).toBeInTheDocument();
    expect(link0).toHaveClass("tab-active");
    expect(link0).toHaveTextContent("Contests");
    fireEvent.click(link0);
    expect(mockRedirect).toHaveBeenCalledWith(
      "/root/contests",
      RedirectType.push,
    );
  });
});
