"use client";

import { LogOutIcon, LogInIcon, SunMoonIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { ContestStatusBadge } from "@/app/_lib/component/display/badge/ContestStatusBadge";
import { CountdownClock } from "@/app/_lib/component/display/CountdownClock";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_lib/component/shadcn/tooltip";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { Theme, useTheme } from "@/app/_lib/provider/ThemeProvider";
import { useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MemberType } from "@/domain/enumerate/MemberType";

/**
 * Header component displayed at the top of the web application.
 * Includes contest title, status, countdown clock, theme switch, and user authentication options.
 */
export function Header() {
  const contest = useAppSelector((state) => state.contest);
  const session = useAppSelector((state) => state.session);
  const contestStatus = useContestStatusWatcher();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  async function handleSignOut() {
    await Composition.sessionWritter.deleteCurrent();
    window.location.href = routes.CONTEST_SIGN_IN(contest.slug);
  }

  const isAuthorized = !!session?.member;
  const isSignInPage = pathname === routes.CONTEST_SIGN_IN(contest.slug);
  const memberType = isAuthorized
    ? {
        [MemberType.ROOT]: "Root",
        [MemberType.ADMIN]: "Admin",
        [MemberType.CONTESTANT]: "Contestant",
        [MemberType.JUDGE]: "Judge",
      }[session.member.type]
    : "";

  return (
    <div
      className="bg-card border-divider grid grid-cols-1 gap-2 border-b px-3 py-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 sm:py-2"
      data-testid="header"
    >
      {/* Mobile layout: Logo and actions in same row */}
      <div className="flex items-center justify-between sm:justify-start">
        <div className="flex gap-2">
          <div className="mr-2 flex items-center justify-center">
            <Image
              src={theme === Theme.DARK ? "/icon-dark.png" : "/icon-light.png"}
              alt="Logo of forseti"
              width={30}
              height={30}
            />
          </div>
          <div className="-mt-1 flex flex-col items-start justify-center">
            <p className="truncate text-base font-semibold sm:text-lg">
              Forseti
            </p>
            <p className="truncate text-xs sm:text-sm" data-testid="title">
              {contest.title}
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
                <SunMoonIcon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
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
                  <LogOutIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          )}
          {!isAuthorized && !isSignInPage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(routes.CONTEST_SIGN_IN(contest.slug))
                  }
                  data-testid="sign-in"
                  className="h-8 px-2"
                >
                  <LogInIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign in</TooltipContent>
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
                    ? contest.startAt
                    : contest.endAt,
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
              <SunMoonIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>
        {isAuthorized && (
          <>
            <Separator orientation="vertical" className="h-8!" />
            <div>
              <p className="text-end text-sm" data-testid="member-name">
                {session.member.name}
              </p>
              <p
                className="text-muted-foreground text-end text-xs font-bold"
                data-testid="member-type"
              >
                {memberType}
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
                  <LogOutIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
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
                  router.push(routes.CONTEST_SIGN_IN(contest.slug))
                }
                data-testid="sign-in"
              >
                <LogInIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sign in</TooltipContent>
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
            {memberType}
          </p>
        </div>
      )}
    </div>
  );
}
