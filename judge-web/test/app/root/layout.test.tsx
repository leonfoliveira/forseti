import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/root/layout";

jest.mock("@/app/_component/navbar", () => ({
  Navbar: ({ signInPath, ...props }: any) => (
    <div data-testid="navbar" {...props}>
      <a href={signInPath} data-testid="sign-in">
        Sign In
      </a>
      Mock Navbar
    </div>
  ),
}));

describe("RootLayout", () => {
  it("renders the navbar and children", () => {
    render(
      <RootLayout>
        <div data-testid="child">Child content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in")).toHaveAttribute("href", "/auth/root");
  });
});
