"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { FormattedMessage } from "react-intl";

import { WaitPage } from "@/app/contests/[slug]/_common/wait-page";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestUtil } from "@/core/util/contest-util";
import { Message } from "@/i18n/message";
import { Navbar } from "@/lib/component/navbar";
import { cls } from "@/lib/util/cls";

type Props = {
  contestMetadata: ContestMetadataResponseDTO;
  tabs: {
    label: Message;
    path: string;
  }[];
  children: React.ReactNode;
};

/**
 * Basic layout for contest dashboard pages.
 */
export function ContestDashboardLayout({
  contestMetadata,
  tabs,
  children,
}: Props) {
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

  if (ContestUtil.getStatus(contestMetadata) === ContestStatus.NOT_STARTED) {
    return <WaitPage contestMetadata={contestMetadata} />;
  }

  return (
    <>
      <Navbar
        contestMetadata={contestMetadata}
        signInPath={routes.CONTEST_SIGN_IN(contestMetadata.slug)}
      />
      <nav className="tabs tabs-lift w-full bg-base-100">
        {tabs.map(buildNavLink)}
        <span className="grow border-b border-base-300" />
      </nav>
      <div className="p-5 bg-base-100">{children}</div>
    </>
  );
}
