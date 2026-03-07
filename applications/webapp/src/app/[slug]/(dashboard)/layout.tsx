"use client";

import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Tabs, TabsList, TabsTrigger } from "@/app/_lib/component/shadcn/tabs";
import { BalloonProvider } from "@/app/_lib/provider/balloon-provider";
import { DashboardProvider } from "@/app/_lib/provider/dashboard-provider";
import { useAppSelector } from "@/app/_store/store";
import { clientConfig } from "@/config/config";
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
  tabAbout: {
    id: "app.[slug].(dashboard).layout.tab-about",
    defaultMessage: "About",
  },
  tabGrafana: {
    id: "app.[slug].(dashboard).layout.tab-grafana",
    defaultMessage: "Grafana",
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
  const slug = useAppSelector((state) => state.contest.slug);
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

  tabs.push({
    title: messages.tabAbout,
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
                  <FormattedMessage {...item.title} />
                </TabsTrigger>
              ))}
            </div>

            {session &&
              [MemberType.ROOT, MemberType.ADMIN, MemberType.STAFF].includes(
                session.member.type,
              ) && (
                <div>
                  <TabsTrigger
                    value="grafana"
                    className="flex-0 justify-self-end whitespace-nowrap"
                    data-testid="tab-grafana"
                  >
                    <Link
                      href={clientConfig.grafanaPublicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-default"
                    >
                      <FormattedMessage {...messages.tabGrafana} />
                      <ExternalLinkIcon className="ml-1 inline" />
                    </Link>
                  </TabsTrigger>
                </div>
              )}
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
