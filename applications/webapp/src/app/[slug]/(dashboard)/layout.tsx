"use client";

import { usePathname, useRouter } from "next/navigation";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Tabs, TabsList, TabsTrigger } from "@/app/_lib/component/shadcn/tabs";
import { BalloonProvider } from "@/app/_lib/provider/balloon-provider";
import { DashboardProvider } from "@/app/_lib/provider/dashboard-provider";
import { useAppSelector } from "@/app/_store/store";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  tabLeaderboard: {
    id: "app.[slug].(dashboard).layout.tab-leaderboard",
    defaultMessage: "Leaderboard",
  },
  tabProblems: {
    id: "app.[slug].(dashboard).layout.tab-problems",
    defaultMessage: "Problems",
  },
  tabSubmissions: {
    id: "app.[slug].(dashboard).layout.tab-submissions",
    defaultMessage: "Submissions",
  },
  tabClarifications: {
    id: "app.[slug].(dashboard).layout.tab-clarifications",
    defaultMessage: "Clarifications",
  },
  tabAnnouncements: {
    id: "app.[slug].(dashboard).layout.tab-announcements",
    defaultMessage: "Announcements",
  },
  tabTickets: {
    id: "app.[slug].(dashboard).layout.tab-tickets",
    defaultMessage: "Tickets",
  },
  tabSettings: {
    id: "app.[slug].(dashboard).layout.tab-settings",
    defaultMessage: "Settings",
  },
});

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
  const slug = useAppSelector((state) => state.contestMetadata.slug);
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    {
      title: messages.tabLeaderboard,
      path: routes.CONTEST_LEADERBOARD(slug),
    },
    {
      title: messages.tabProblems,
      path: routes.CONTEST_PROBLEMS(slug),
    },
    {
      title: messages.tabSubmissions,
      path: routes.CONTEST_SUBMISSIONS(slug),
    },
    {
      title: messages.tabClarifications,
      path: routes.CONTEST_CLARIFICATIONS(slug),
    },
    {
      title: messages.tabAnnouncements,
      path: routes.CONTEST_ANNOUNCEMENTS(slug),
    },
  ];

  if (!!session?.member) {
    tabs.push({
      title: messages.tabTickets,
      path: routes.CONTEST_TICKETS(slug),
    });
  }

  if (
    session &&
    [MemberType.ROOT, MemberType.ADMIN].includes(session.member.type)
  ) {
    tabs.push({
      title: messages.tabSettings,
      path: routes.CONTEST_SETTINGS(slug),
    });
  }

  return (
    <DashboardProvider>
      <Tabs
        className="bg-card border-divider border-b"
        value={pathname}
        onValueChange={(path) => router.push(path)}
        data-testid="dashboard-tabs"
      >
        <div className="scrollbar-hide overflow-x-auto overflow-y-hidden">
          <TabsList variant="line" className="min-w-max">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.path}
                value={item.path}
                data-testid={`tab-${item.path}`}
                className="whitespace-nowrap"
              >
                <FormattedMessage {...item.title} />
              </TabsTrigger>
            ))}
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
