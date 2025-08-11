import { redirect, RedirectType, usePathname } from "next/navigation";
import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { cls } from "@/app/_util/cls";
import { routes } from "@/config/routes";
import { Message } from "@/i18n/message";

const messages = defineMessages({
  tabContests: {
    id: "app.root.(dashboard)._component.root-tab-bar.tab-contests",
    defaultMessage: "Contests",
  },
});

export function RootTabBar() {
  const pathname = usePathname();

  function buildNavLink(label: Message, path: string) {
    const isActive = pathname.startsWith(path);
    return (
      <a
        key={path}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => redirect(path, RedirectType.push)}
        data-testid={`link:${path}`}
      >
        <FormattedMessage {...label} />
      </a>
    );
  }

  function buildLinks() {
    return [buildNavLink(messages.tabContests, routes.ROOT_CONTESTS)];
  }

  return (
    <nav className="tabs tabs-lift w-full bg-base-100">
      {buildLinks()}
      <span className="grow border-b border-base-300"></span>
    </nav>
  );
}
