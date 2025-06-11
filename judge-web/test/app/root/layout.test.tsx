import { fireEvent, render, screen } from "@testing-library/react";
import RootLayout from "@/app/root/(dashboard)/layout";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/app/_action/root-sign-out-action", () => ({
  useRootSignOutAction: jest.fn().mockReturnValue({
    act: jest.fn(),
  }),
}));

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: jest.fn(),
  }),
}));

describe("RootLayout", () => {
  const mockUseRootSignOutActionAct = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(
        require("@/app/_action/root-sign-out-action"),
        "useRootSignOutAction",
      )
      .mockReturnValue({
        act: mockUseRootSignOutActionAct,
      });
  });

  it("renders the navbar and children", () => {
    const mockToggleTheme = jest.fn();
    jest.spyOn(require("@/app/_util/theme-hook"), "useTheme").mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });

    render(
      <RootLayout>
        <div data-testid="child">Child content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-theme")).not.toBeChecked();
    expect(screen.getByTestId("navbar-member")).toHaveTextContent("Root");
    fireEvent.click(screen.getByTestId("navbar-signout"));
    expect(mockUseRootSignOutActionAct).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("navbar-theme"));
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it("render correct theme toggle on dark theme", () => {
    jest.spyOn(require("@/app/_util/theme-hook"), "useTheme").mockReturnValue({
      theme: "dark",
      toggleTheme: jest.fn(),
    });

    render(
      <RootLayout>
        <div data-testid="child">Child content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("navbar-theme")).toBeChecked();
  });
});
