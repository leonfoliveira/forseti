import { cls } from "@/app/_util/cls";
import React from "react";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { routes } from "@/app/_routes";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { usePathname, useRouter } from "next/navigation";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useTranslations } from "next-intl";

/**
 * Component that renders the tab bar for contest pages.
 * Different tabs are displayed based on the user's authorization level (contestant, jury, or guest).
 */
export function ContestTabBar() {
  const { authorization } = useAuthorization();
  const contest = useContestMetadata();

  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("contests.[slug]._component.contest-tab-bar");

  function buildNavLink(label: string, path: (slug: string) => string) {
    const fullPath = path(contest.slug);
    const isActive = pathname === fullPath;
    return (
      <a
        key={fullPath}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => router.push(fullPath)}
        data-testid={`link:${path}`}
      >
        {label}
      </a>
    );
  }

  function buildLinks() {
    switch (authorization?.member.type) {
      case MemberType.CONTESTANT:
        return [
          buildNavLink(
            t("tab-leaderboard"),
            routes.CONTEST_CONTESTANT_LEADERBOARD,
          ),
          buildNavLink(t("tab-problems"), routes.CONTEST_CONTESTANT_PROBLEMS),
          buildNavLink(t("tab-timeline"), routes.CONTEST_CONTESTANT_TIMELINE),
          buildNavLink(
            t("tab-submissions"),
            routes.CONTEST_CONTESTANT_SUBMISSIONS,
          ),
        ];
      case MemberType.JURY:
        return [
          buildNavLink(t("tab-leaderboard"), routes.CONTEST_JURY_LEADERBOARD),
          buildNavLink(t("tab-problems"), routes.CONTEST_JURY_PROBLEMS),
          buildNavLink(t("tab-submissions"), routes.CONTEST_JURY_SUBMISSIONS),
        ];
      default:
        return [
          buildNavLink(t("tab-leaderboard"), routes.CONTEST_GUEST_LEADERBOARD),
          buildNavLink(t("tab-problems"), routes.CONTEST_GUEST_PROBLEMS),
          buildNavLink(t("tab-timeline"), routes.CONTEST_GUEST_TIMELINE),
        ];
    }
  }

  return (
    <nav className="tabs tabs-lift w-full bg-base-100">
      {buildLinks()}
      <span className="grow border-b border-base-300"></span>
    </nav>
  );
}
