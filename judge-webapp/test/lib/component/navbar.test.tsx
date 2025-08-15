import { fireEvent, render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import { act } from "react";

import { authenticationService } from "@/config/composition";
import { CountdownClock } from "@/lib/component/countdown-clock";
import { Navbar } from "@/lib/component/navbar";
import { useTheme } from "@/lib/util/theme-hook";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import {
  mockAppDispatch,
  mockRouter,
  mockUseAuthorization,
} from "@/test/jest.setup";

jest.mock("@/lib/util/theme-hook", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/lib/component/countdown-clock", () => ({
  CountdownClock: jest.fn(),
}));

describe("Navbar", () => {
  const mockToggleTheme = jest.fn();
  const mockRedirect = jest.fn();

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });
    (redirect as unknown as jest.Mock).mockImplementation(mockRedirect);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the root title when no contest metadata is provided", () => {
    render(<Navbar signInPath="/sign-in" />);
    expect(screen.getByTestId("title")).toHaveTextContent("Judge - Root");
  });

  it("renders the contest title when contest metadata is provided", () => {
    const contestMetadata = { title: "My Contest" } as any;
    render(<Navbar contestMetadata={contestMetadata} signInPath="/sign-in" />);
    expect(screen.getByTestId("title")).toHaveTextContent("My Contest");
  });

  it("renders countdown clock when contest is ongoing", () => {
    const contestMetadata = {
      title: "My Contest",
      endAt: new Date(Date.now() + 10000).toISOString(),
    } as any;
    render(<Navbar contestMetadata={contestMetadata} signInPath="/sign-in" />);
    expect(CountdownClock).toHaveBeenCalledWith(
      {
        className: expect.any(String),
        to: new Date(contestMetadata.endAt),
      },
      undefined,
    );
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
    expect(screen.getByTestId("member")).toHaveTextContent("Guest");
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

  it("calls redirect on sign out click when authorized", async () => {
    render(<Navbar signInPath="/sign-in" />);
    fireEvent.click(screen.getByTestId("member"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("sign"));
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      authorizationSlice.actions.reset(),
    );
    expect(authenticationService.cleanAuthorization).toHaveBeenCalled();
    expect(mockAppDispatch).toHaveBeenCalledWith(
      authorizationSlice.actions.success(null),
    );
    expect(mockRouter.push).toHaveBeenCalledWith("/sign-in");
  });
});
