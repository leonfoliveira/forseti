"use client";

import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { defineMessages } from "@/i18n/message";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { Tab, Tabs } from "@/lib/heroui-wrapper";
import { DashboardProvider } from "@/lib/provider/dashboard-provider";
import { useAppSelector } from "@/store/store";

const messages = defineMessages({
  tabLeaderboard: {
    id: "app.[slug].(dashboard).layout.tab-leaderboard",
    defaultMessage: "Leaderboard",
  },
  tabProblems: {
    id: "app.[slug].(dashboard).layout.tab-problems",
    defaultMessage: "Problems",
  },
  tabTimeline: {
    id: "app.[slug].(dashboard).layout.tab-timeline",
    defaultMessage: "Timeline",
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
  tabSettings: {
    id: "app.[slug].(dashboard).layout.tab-settings",
    defaultMessage: "Settings",
  },
});

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
        variant="underlined"
        color="primary"
        className="bg-content1"
        selectedKey={pathname}
        data-testid="dashboard-nav"
      >
        {tabs.map((item) => (
          <Tab
            key={item.path}
            title={<FormattedMessage {...item.title} />}
            onClick={() => router.push(item.path)}
          />
        ))}
      </Tabs>
      <div className="flex-1 w-full max-w-[1920] mx-auto xl:my-10 flex flex-col">
        {children}
      </div>
    </DashboardProvider>
  );
}
