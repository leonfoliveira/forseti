import { fireEvent, render, screen } from "@testing-library/react";
import { RootTabBar } from "@/app/root/(dashboard)/_component/root-tab-bar";
import { routes } from "@/app/_routes";
import { redirect } from "@/test/jest.setup";
import { RedirectType, usePathname } from "next/navigation";

describe("RootTabBar", () => {
  it("renders the contests tab", () => {
    render(<RootTabBar />);

    const contestsLink = screen.getByTestId(`link:${routes.ROOT_CONTESTS}`);
    expect(contestsLink).toBeInTheDocument();
    expect(contestsLink).toHaveTextContent("tab-contests");

    fireEvent.click(contestsLink);
    expect(redirect).toHaveBeenCalledWith(
      routes.ROOT_CONTESTS,
      RedirectType.push,
    );
  });

  it("marks the active tab", () => {
    const pathname = `${routes.ROOT_CONTESTS}/123`;
    (usePathname as jest.Mock).mockReturnValue(pathname);

    render(<RootTabBar />);

    const contestsLink = screen.getByTestId(`link:${routes.ROOT_CONTESTS}`);
    expect(contestsLink).toHaveClass("tab-active");
  });
});
