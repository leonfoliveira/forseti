import { fireEvent, render, screen } from "@testing-library/react";
import { Navbar } from "@/app/_component/navbar";
import { useTheme } from "@/app/_util/theme-hook";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { redirect, RedirectType } from "next/navigation";
import { mockUseAuthorization } from "@/test/jest.setup";

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/app/contests/[slug]/_util/wait-clock-hook", () => ({
  useWaitClock: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  RedirectType: {
    push: "push",
  },
}));

describe("Navbar", () => {
  const mockToggleTheme = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });
    (useWaitClock as jest.Mock).mockReturnValue({ current: null });
    (redirect as unknown as jest.Mock).mockImplementation(mockRedirect);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the root title when no contest metadata is provided", () => {
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("title")).toHaveTextContent("root-title");
  });

  it("renders the contest title when contest metadata is provided", () => {
    const contestMetadata = { title: "My Contest" } as any;
    render(<Navbar contestMetadata={contestMetadata} signInPath="/sign-in" />);
    expect(screen.getByTestId("title")).toHaveTextContent("My Contest");
  });

  it("toggles theme when the theme switch is clicked", () => {
    render(<Navbar signInPath="/sign-in" />);
    const themeToggle = screen.getByTestId("theme");
    fireEvent.click(themeToggle);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("displays guest name when no authorization is present", () => {
    mockUseAuthorization.mockReturnValueOnce(undefined);
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("member")).toHaveTextContent("guest-name");
  });

  it("displays guest name when logged as root", () => {
    mockUseAuthorization.mockReturnValueOnce({
      member: { name: "guest-name", type: "ROOT" },
    });
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("member")).toHaveTextContent("guest-name");
  });

  it("displays member name when authorization is present", () => {
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("member")).toHaveTextContent("Test User");
  });

  it("calls redirect on sign out click when authorized", () => {
    render(<Navbar signInPath="/sign-in" />);
    fireEvent.click(screen.getByTestId("member"));
    fireEvent.click(screen.getByTestId("sign"));
    expect(mockRedirect).toHaveBeenCalledWith("/sign-in", RedirectType.push);
  });

  it("calls redirect on sign in click when not authorized", () => {
    render(<Navbar signInPath="/sign-in" />);
    fireEvent.click(screen.getByTestId("member"));
    fireEvent.click(screen.getByTestId("sign"));
    expect(mockRedirect).toHaveBeenCalledWith("/sign-in", RedirectType.push);
  });
});
