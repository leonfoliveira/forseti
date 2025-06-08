"use client";

import React, { use, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useSubscribeForMemberSubmissionAction } from "@/app/_action/subscribe-for-member-submission-action";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { useFindContestMetadataBySlugAction } from "@/app/_action/find-contest-metadata-by-slug-action";
import { cls } from "@/app/_util/cls";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestProvider } from "@/app/contests/[slug]/_context";
import { ContestNavbar } from "@/app/contests/[slug]/_component/contest-navbar";
import { LoadingPage } from "@/app/_component/loading-page";
import { ErrorPage } from "@/app/_component/error-page";
import { WaitPage } from "@/app/_component/wait-page";

export default function ContestLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = use(params);

  const { data: metadata, ...findContestMetadataBySlugAction } =
    useFindContestMetadataBySlugAction();
  const subscribeForMemberSubmissionAction =
    useSubscribeForMemberSubmissionAction();

  const router = useRouter();
  const pathname = usePathname();
  const authorization = useAuthorization();

  useEffect(() => {
    findContestMetadataBySlugAction.act(slug);
  }, [slug]);

  useEffect(() => {
    if (authorization?.member.type === MemberType.CONTESTANT) {
      subscribeForMemberSubmissionAction.act(authorization.member.id);
    }
  }, [authorization]);

  if (findContestMetadataBySlugAction.isLoading) {
    return <LoadingPage />;
  }
  if (findContestMetadataBySlugAction.error) {
    return <ErrorPage />;
  }
  if (!metadata) return null;
  if (metadata.status === ContestStatus.NOT_STARTED) {
    return <WaitPage metadata={metadata} />;
  }

  function buildNavLink(label: string, path: string) {
    const isActive = pathname === `/contests/${slug}/${path}`;
    return (
      <a
        key={path}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => router.push(`/contests/${slug}/${path}`)}
        data-testid={`link:${path}`}
      >
        {label}
      </a>
    );
  }

  function buildBuildNavLinks() {
    if (authorization?.member.type === MemberType.CONTESTANT) {
      return [
        buildNavLink("Leaderboard", "leaderboard"),
        buildNavLink("Problems", "problems"),
        buildNavLink("Submissions", "submissions"),
        buildNavLink("Timeline", "timeline"),
      ];
    }

    return [
      buildNavLink("Leaderboard", "leaderboard"),
      buildNavLink("Problems", "problems"),
      buildNavLink("Timeline", "timeline"),
    ];
  }

  return (
    <div>
      <ContestProvider metadata={metadata}>
        <ContestNavbar />
        <div className="mt-2">
          <nav className="tabs tabs-lift w-full">{buildBuildNavLinks()}</nav>
          <div className="p-5 bg-base-100">{children}</div>
        </div>
      </ContestProvider>
    </div>
  );
}
