"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/app/_lib/component/shadcn/tabs";
import { BalloonProvider } from "@/app/_lib/provider/BalloonProvider";
import { DashboardProvider } from "@/app/_lib/provider/DashboardProvider";
import { useAppSelector } from "@/app/_lib/store/Store";
import { routes } from "@/config/routes";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Default layout for contest dashboard pages.
 * Displays navigation tabs and wraps child components with the appropriate provider.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const slug = useAppSelector((state) => state.contest.slug);
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    {
      title: "Leaderboard",
      path: routes.CONTEST_LEADERBOARD(slug),
    },
    {
      title: "Problems",
      path: routes.CONTEST_PROBLEMS(slug),
    },
    {
      title: "Submissions",
      path: routes.CONTEST_SUBMISSIONS(slug),
    },
    {
      title: "Announcements",
      path: routes.CONTEST_ANNOUNCEMENTS(slug),
    },
  ];

  if (
    session &&
    [MemberType.ROOT, MemberType.ADMIN].includes(session.member.type)
  ) {
    tabs.push({
      title: "Settings",
      path: routes.CONTEST_SETTINGS(slug),
    });
  }

  tabs.push({
    title: "About",
    path: routes.CONTEST_ABOUT(slug),
  });

  return (
    <DashboardProvider>
      <Tabs
        className="bg-card border-divider border-b"
        value={pathname}
        data-testid="dashboard-tabs"
      >
        <div className="scrollbar-hide overflow-x-auto overflow-y-hidden">
          <TabsList
            variant="line"
            className="flex w-full min-w-max justify-between"
          >
            <div>
              {tabs.map((item) => (
                <TabsTrigger
                  key={item.path}
                  value={item.path}
                  className="flex-0 whitespace-nowrap"
                  onClick={() => router.push(item.path)}
                  data-testid={`tab-${item.path}`}
                >
                  {item.title}
                </TabsTrigger>
              ))}
            </div>

            {session &&
              [MemberType.ROOT, MemberType.ADMIN].includes(session.member.type)}
          </TabsList>
        </div>
      </Tabs>
      <div className="mx-auto flex w-full max-w-[1920px] flex-1 flex-col">
        {children}
      </div>
      <BalloonProvider />
    </DashboardProvider>
  );
}
