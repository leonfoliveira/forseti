"use client";

import React from "react";
import { cls } from "@/app/_util/cls";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { usePathname, useRouter } from "next/navigation";
import { useContestMetadata } from "@/app/_context/contest-metadata-context";
import { useAuthorization } from "@/app/_context/authorization-context";
import { ContestProvider } from "@/app/_context/contest-context";
import { ContestNavbar } from "@/app/contests/[slug]/(dashboard)/_component/contest-navbar";
import { routes } from "@/app/_routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { WaitPage } from "@/app/contests/[slug]/(dashboard)/_component/wait-page";

export default function ContestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metadata = useContestMetadata();
  const { authorization } = useAuthorization();

  const router = useRouter();
  const pathname = usePathname();

  function buildNavLink(label: string, path: (slug: string) => string) {
    const fullPath = path(metadata.slug);
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

  function buildBuildNavLinks() {
    if (authorization?.member.type === MemberType.CONTESTANT) {
      return [
        buildNavLink("Leaderboard", routes.CONTEST_LEADERBOARD),
        buildNavLink("Problems", routes.CONTEST_PROBLEMS),
        buildNavLink("Timeline", routes.CONTEST_TIMELINE),
        buildNavLink("Submissions", routes.CONTEST_SUBMISSIONS),
      ];
    }

    if (authorization?.member.type === MemberType.JURY) {
      return [
        buildNavLink("Leaderboard", routes.CONTEST_LEADERBOARD),
        buildNavLink("Problems", routes.CONTEST_PROBLEMS),
        buildNavLink("Timeline", routes.CONTEST_TIMELINE),
        buildNavLink("Submissions", routes.CONTEST_SUBMISSIONS),
      ];
    }

    return [
      buildNavLink("Leaderboard", routes.CONTEST_LEADERBOARD),
      buildNavLink("Problems", routes.CONTEST_PROBLEMS),
      buildNavLink("Timeline", routes.CONTEST_TIMELINE),
    ];
  }

  if (metadata.status === ContestStatus.NOT_STARTED) {
    return <WaitPage />;
  }

  return (
    <div>
      <ContestProvider>
        <ContestNavbar />
        <div className="mt-2">
          <nav className="tabs tabs-lift w-full">{buildBuildNavLinks()}</nav>
          <div className="p-5 bg-base-100">{children}</div>
        </div>
      </ContestProvider>
    </div>
  );
}
