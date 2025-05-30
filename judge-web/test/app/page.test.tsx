import { render, screen, fireEvent } from "@testing-library/react";
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
    const input = await screen.findByTestId("contest-input");
    fireEvent.change(input, { target: { value: "123" } });
    const guestButton = await screen.findByTestId("guest-button");
    fireEvent.click(guestButton);

    expect(mockPush).toHaveBeenCalledWith("/contests/123");
  });

  it("navigates to the authenticated contest page when Sign In button is clicked with valid input", async () => {
    render(<AppPage />);
    const input = await screen.findByTestId("contest-input");
    fireEvent.change(input, { target: { value: "456" } });
    const signInButton = await screen.findByTestId("signin-button");
    fireEvent.click(signInButton);

    expect(mockPush).toHaveBeenCalledWith("/auth/contests/456");
  });

  it("navigates to the root page when Root button is clicked", async () => {
    render(<AppPage />);
    const rootButton = await screen.findByTestId("root-button");
    fireEvent.click(rootButton);

    expect(mockPush).toHaveBeenCalledWith("/auth/root");
  });

  it("does not navigate when Guest button is clicked with empty input", async () => {
    render(<AppPage />);
    const guestButton = await screen.findByTestId("guest-button");
    fireEvent.click(guestButton);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not navigate when Sign In button is clicked with empty input", async () => {
    render(<AppPage />);
    const signInButton = await screen.findByTestId("signin-button");
    fireEvent.click(signInButton);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
