import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppPage from "@/app/page";
import { useRouter } from "next/navigation";
import React from "react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("AppPage", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("navigates to the guest contest page when Guest button is clicked with valid input", async () => {
    render(<AppPage />);
    const input = screen.getByTestId("contest-input:input");
    fireEvent.change(input, { target: { value: "123" } });
    const guestButton = screen.getByTestId("guest-button");

    await waitFor(() => {
      fireEvent.click(guestButton);

      expect(mockPush).toHaveBeenCalledWith("/contests/123");
    });
  });

  it("navigates to the authenticated contest page when Sign In button is clicked with valid input", async () => {
    render(<AppPage />);
    const input = screen.getByTestId("contest-input:input");
    fireEvent.change(input, { target: { value: "456" } });
    const signInButton = screen.getByTestId("signin-button");

    await waitFor(() => {
      fireEvent.click(signInButton);

      expect(mockPush).toHaveBeenCalledWith("/auth/contests/456");
    });
  });

  it("navigates to the root page when Root button is clicked", () => {
    render(<AppPage />);
    const rootButton = screen.getByTestId("root-button");
    fireEvent.click(rootButton);

    expect(mockPush).toHaveBeenCalledWith("/auth/root");
  });

  it("does not navigate when Guest button is clicked with empty input", async () => {
    render(<AppPage />);
    const guestButton = screen.getByTestId("guest-button");

    await waitFor(() => {
      fireEvent.click(guestButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("does not navigate when Sign In button is clicked with empty input", async () => {
    render(<AppPage />);
    const signInButton = screen.getByTestId("signin-button");

    await waitFor(() => {
      fireEvent.click(signInButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
