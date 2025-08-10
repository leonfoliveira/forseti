"use client";

import React from "react";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { WaitPage } from "@/app/contests/[slug]/_common/wait-page";
import { ContestTabBar } from "@/app/contests/[slug]/_component/contest-tab-bar";
import { ContestUtil } from "@/core/util/contest-util";
import { Navbar } from "@/app/_component/navbar";
import { routes } from "@/config/routes";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { Message } from "@/i18n/message";

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
  if (ContestUtil.getStatus(contestMetadata) === ContestStatus.NOT_STARTED) {
    return <WaitPage contestMetadata={contestMetadata} />;
  }

  return (
    <>
      <Navbar
        contestMetadata={contestMetadata}
        signInPath={routes.CONTEST_SIGN_IN(contestMetadata.slug)}
      />
      <ContestTabBar tabs={tabs} />
      <div className="p-5 bg-base-100">{children}</div>
    </>
  );
}
