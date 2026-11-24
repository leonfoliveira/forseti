import { screen } from "@testing-library/react";
import React from "react";

import { DashboardLayout } from "@/app/[slug]/(dashboard)/DashboardLayout";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/provider/BalloonProvider", () => ({
  BalloonProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="balloon-provider">{children}</div>
  ),
}));
jest.mock("@/app/_lib/provider/DashboardProvider", () => ({
  DashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-provider">{children}</div>
  ),
}));
jest.mock("@/app/_lib/component/layout/Navbar", () => ({
  Navbar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navbar">{children}</div>
  ),
}));

describe("DashboardLayout", () => {
  it("shows common navigation and admin settings, routing on selection", async () => {
    await renderWithProviders(<DashboardLayout />);

    expect(screen.getByTestId("balloon-provider")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-provider")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });
});
