import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { FormattedMessage } from "react-intl";

import { cls } from "@/app/_util/cls";
import { Message } from "@/i18n/message";


type Props = {
  tabs: {
    label: Message;
    path: string;
  }[];
};

/**
 * Component that renders the tab bar for contest pages.
 * Different tabs are displayed based on the user's authorization level (contestant, judge, or guest).
 */
export function ContestTabBar({ tabs }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function buildNavLink({ label, path }: { label: Message; path: string }) {
    const isActive = pathname === path;
    return (
      <a
        key={path}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => router.push(path)}
        data-testid="tab"
      >
        <FormattedMessage {...label} />
      </a>
    );
  }

  return (
    <nav className="tabs tabs-lift w-full bg-base-100">
      {tabs.map(buildNavLink)}
      <span className="grow border-b border-base-300"></span>
    </nav>
  );
}
