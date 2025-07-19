import { fireEvent, render, screen } from "@testing-library/react";
import { Navbar } from "@/app/_component/navbar";
import { useTheme } from "@/app/_util/theme-hook";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { redirect, RedirectType } from "next/navigation";

jest.mock("@/app/_util/theme-hook", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/app/_component/context/authorization-context", () => ({
  useAuthorization: jest.fn(),
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
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: null,
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
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("member")).toHaveTextContent("guest-name");
  });

  it("displays member name when authorization is present", () => {
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: { member: { name: "John Doe" } } as unknown,
    });
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("member")).toHaveTextContent("John Doe");
  });

  it("calls redirect on sign out click when authorized", () => {
    (useAuthorization as jest.Mock).mockReturnValue({
      authorization: { member: { name: "John Doe" } },
    });
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
