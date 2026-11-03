import { Outlet } from "react-router-dom";

import { BalloonProvider } from "@/app/_lib/provider/BalloonProvider";
import { DashboardProvider } from "@/app/_lib/provider/DashboardProvider";
import { Navbar } from "@/app/_lib/component/layout/Navbar";

/**
 * Default layout for contest dashboard pages.
 * Displays navigation tabs and wraps child components with the appropriate provider.
 */
export function DashboardLayout() {
  return (
    <DashboardProvider>
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1920px] flex-1 flex-col">
        <Outlet />
      </div>
      <BalloonProvider />
    </DashboardProvider>
  );
}
