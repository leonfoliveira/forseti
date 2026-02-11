"use client";

import { LogOut, LogIn, SunMoon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { ContestStatusBadge } from "@/app/_lib/component/display/badge/contest-status-badge";
import { CountdownClock } from "@/app/_lib/component/display/countdown-clock";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_lib/component/shadcn/tooltip";
import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
import { useTheme } from "@/app/_lib/util/theme-hook";
import { useAppSelector } from "@/app/_store/store";
import { sessionWritter } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  toggleThemeTooltip: {
    id: "app._lib.component.layout.header.toggle-theme-tooltip",
    defaultMessage: "Toggle theme",
  },
  signInTooltip: {
    id: "app._lib.component.layout.header.sign-in-tooltip",
    defaultMessage: "Sign in",
  },
  signOutTooltip: {
    id: "app._lib.component.layout.header.sign-out-tooltip",
    defaultMessage: "Sign out",
  },
});

/**
 * Header component displayed at the top of the web application.
 * Includes contest title, status, countdown clock, theme switch, and user authentication options.
 */
export function Header() {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const session = useAppSelector((state) => state.session);
  const contestStatus = useContestStatusWatcher();
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme } = useTheme();

  async function handleSignOut() {
    await sessionWritter.deleteCurrent();
    window.location.href = routes.CONTEST_SIGN_IN(contestMetadata.slug);
  }

  const isAuthorized = !!session?.member;
  const isSignInPage =
    pathname === routes.CONTEST_SIGN_IN(contestMetadata.slug);

  return (
    <div
      className="bg-card border-divider grid [grid-template-columns:1fr_auto_1fr] items-center justify-center gap-4 border-b px-6 py-2"
      data-testid="header"
    >
      <div className="flex gap-2">
        <div className="flex items-center justify-center">
          <Image src="/icon.png" alt="Logo of forseti" width={50} height={50} />
        </div>
        <div className="-mt-1 flex flex-col items-start justify-center">
          <p className="truncate text-lg font-semibold">Forseti</p>
          <p className="text-sm" data-testid="title">
            {contestMetadata.title}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <ContestStatusBadge status={contestStatus} data-testid="status" />
          {contestStatus !== ContestStatus.ENDED && (
            <CountdownClock
              className="font-mono text-sm"
              to={
                new Date(
                  contestStatus === ContestStatus.NOT_STARTED
                    ? contestMetadata.startAt
                    : contestMetadata.endAt,
                )
              }
              data-testid="countdown-clock"
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              <SunMoon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <FormattedMessage {...messages.toggleThemeTooltip} />
          </TooltipContent>
        </Tooltip>
        {isAuthorized && (
          <>
            <Separator orientation="vertical" className="!h-8" />
            <div>
              <p className="text-end text-sm" data-testid="member-name">
                {session.member.name}
              </p>
              <p
                className="text-end text-xs font-bold"
                data-testid="member-type"
              >
                <FormattedMessage
                  {...globalMessages.memberType[session.member.type]}
                />
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  data-testid="sign-out"
                >
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <FormattedMessage {...messages.signOutTooltip} />
              </TooltipContent>
            </Tooltip>
          </>
        )}
        {!isAuthorized && !isSignInPage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(routes.CONTEST_SIGN_IN(contestMetadata.slug))
                }
                data-testid="sign-in"
              >
                <LogIn size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <FormattedMessage {...messages.signInTooltip} />
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
