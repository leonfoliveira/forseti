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
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { useTheme } from "@/app/_lib/hook/theme-hook";
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
      className="bg-card border-divider grid grid-cols-1 gap-2 border-b px-3 py-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 sm:py-2"
      data-testid="header"
    >
      {/* Mobile layout: Logo and actions in same row */}
      <div className="flex items-center justify-between sm:justify-start">
        <div className="flex gap-2">
          <div className="flex items-center justify-center">
            <Image
              src="/icon.png"
              alt="Logo of forseti"
              width={40}
              height={40}
              className="sm:h-[50px] sm:w-[50px]"
            />
          </div>
          <div className="-mt-1 flex flex-col items-start justify-center">
            <p className="truncate text-base font-semibold sm:text-lg">
              Forseti
            </p>
            <p className="truncate text-xs sm:text-sm" data-testid="title">
              {contestMetadata.title}
            </p>
          </div>
        </div>

        {/* Mobile actions - only show theme toggle and sign in/out */}
        <div className="flex items-center gap-2 sm:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                data-testid="theme-toggle"
                className="h-8 w-8"
              >
                <SunMoon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <FormattedMessage {...messages.toggleThemeTooltip} />
            </TooltipContent>
          </Tooltip>
          {isAuthorized && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  data-testid="sign-out"
                  className="h-8 w-8"
                >
                  <LogOut size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <FormattedMessage {...messages.signOutTooltip} />
              </TooltipContent>
            </Tooltip>
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
                  className="h-8 px-2"
                >
                  <LogIn size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <FormattedMessage {...messages.signInTooltip} />
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Contest status - center on mobile, middle column on desktop */}
      <div className="flex items-center justify-center sm:col-start-2">
        <div className="flex flex-col items-center justify-center gap-1">
          <ContestStatusBadge status={contestStatus} data-testid="status" />
          {contestStatus !== ContestStatus.ENDED && (
            <CountdownClock
              className="font-mono text-xs sm:text-sm"
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

      {/* Desktop actions - hidden on mobile */}
      <div className="hidden items-center justify-end gap-4 sm:col-start-3 sm:flex">
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

      {/* Mobile user info bar - only show when authorized */}
      {isAuthorized && (
        <div className="border-divider flex items-center justify-center border-t pt-2 text-center sm:hidden">
          <p className="text-sm" data-testid="member-name">
            {session.member.name}
          </p>
          <Separator orientation="vertical" className="mx-2" />
          <p className="text-xs font-bold" data-testid="member-type">
            <FormattedMessage
              {...globalMessages.memberType[session.member.type]}
            />
          </p>
        </div>
      )}
    </div>
  );
}
