import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";

import DashboardLayout from "@/app/[slug]/(dashboard)/layout";
import { MemberType } from "@/domain/enumerate/MemberType";
import {
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/provider/DashboardProvider", () => ({
  DashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-provider">{children}</div>
  ),
}));
jest.mock("@/app/_lib/provider/BalloonProvider", () => ({
  BalloonProvider: () => <div data-testid="balloons" />,
}));
jest.mock("@/app/_lib/component/shadcn/tabs", () => ({
  Tabs: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsTrigger: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("DashboardLayout", () => {
  it("shows common navigation and admin settings, routing on selection", async () => {
    jest.mocked(usePathname).mockReturnValue("/spring/leaderboard");
    const router = useRouter();
    await renderWithProviders(
      <DashboardLayout>
        <main>Dashboard</main>
      </DashboardLayout>,
      {
        contest: MockContestResponseDTO({ slug: "spring" }),
        session: MockSessionResponseDTO({
          member: { id: "member-1", name: "Admin", type: MemberType.ADMIN },
        }),
      },
    );
    expect(screen.getByTestId("tab-/spring/settings")).toHaveTextContent(
      "Settings",
    );
    fireEvent.click(screen.getByTestId("tab-/spring/problems"));
    expect(router.push).toHaveBeenCalledWith("/spring/problems");
    expect(screen.getByTestId("balloons")).toBeInTheDocument();
  });
});
