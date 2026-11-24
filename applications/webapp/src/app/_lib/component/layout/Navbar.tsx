import { useLocation, useNavigate } from "react-router-dom";

import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Tabs, TabsList, TabsTrigger } from "@/app/_lib/component/shadcn/tabs";
import { useAppSelector } from "@/app/_lib/store/Store";
import { routes } from "@/config/routes";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Default layout for contest dashboard pages.
 * Displays navigation tabs and wraps child components with the appropriate provider.
 */
export function Navbar() {
  const session = useAppSelector((state) => state.session);
  const slug = useAppSelector((state) => state.contest.slug);
  const contest = useAppSelector((state) => state.contest);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      title: <FormattedMessage id="_lib.component.layout.Navbar.leaderboard" />,
      path: routes.CONTEST_LEADERBOARD(slug),
      "data-testid": `tab-leaderboard`,
    },
    {
      title: <FormattedMessage id="_lib.component.layout.Navbar.problems" />,
      path: routes.CONTEST_PROBLEMS(slug),
      "data-testid": `tab-problems`,
    },
    {
      title: <FormattedMessage id="_lib.component.layout.Navbar.submissions" />,
      path: routes.CONTEST_SUBMISSIONS(slug),
      "data-testid": `tab-submissions`,
    },
    {
      title: (
        <FormattedMessage id="_lib.component.layout.Navbar.announcements" />
      ),
      path: routes.CONTEST_ANNOUNCEMENTS(slug),
      "data-testid": `tab-announcements`,
    },
  ];

  if (contest.settings.isClarificationEnabled) {
    tabs.push({
      title: (
        <FormattedMessage id="_lib.component.layout.Navbar.clarifications" />
      ),
      path: routes.CONTEST_CLARIFICATIONS(slug),
      "data-testid": `tab-clarifications`,
    });
  }

  if (
    contest.settings.isPrintRequestEnabled &&
    session &&
    [
      MemberType.ROOT,
      MemberType.ADMIN,
      MemberType.STAFF,
      MemberType.CONTESTANT,
      MemberType.UNOFFICIAL_CONTESTANT,
    ].includes(session.member.type)
  ) {
    tabs.push({
      title: (
        <FormattedMessage id="_lib.component.layout.Navbar.printRequests" />
      ),
      path: routes.CONTEST_PRINT_REQUESTS(slug),
      "data-testid": `tab-print-requests`,
    });
  }

  if (
    session &&
    [MemberType.ROOT, MemberType.ADMIN].includes(session.member.type)
  ) {
    tabs.push({
      title: <FormattedMessage id="_lib.component.layout.Navbar.settings" />,
      path: routes.CONTEST_SETTINGS(slug),
      "data-testid": `tab-settings`,
    });
  }

  tabs.push({
    title: <FormattedMessage id="_lib.component.layout.Navbar.about" />,
    path: routes.CONTEST_ABOUT(slug),
    "data-testid": `tab-about`,
  });

  return (
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
                onClick={() => navigate(item.path)}
                data-testid={item["data-testid"]}
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
  );
}
