"use client";

import { ChevronDownIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/app/_lib/component/base/form/button";
import { Switch } from "@/app/_lib/component/base/form/switch";
import { Navbar } from "@/app/_lib/component/base/navigation/navbar";
import { Dropdown } from "@/app/_lib/component/base/overlay/dropdown";
import { ContestStatusChip } from "@/app/_lib/component/chip/contest-status-chip";
import { CountdownClock } from "@/app/_lib/component/countdown-clock";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
import { Theme, useTheme } from "@/app/_lib/util/theme-hook";
import { useAppSelector } from "@/app/_store/store";
import { sessionWritter } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  signIn: {
    id: "app._lib.component.header.sign-in",
    defaultMessage: "Sign In",
  },
  signOut: {
    id: "app._lib.component.header.sign-out",
    defaultMessage: "Sign Out",
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
  const { theme, toggleTheme } = useTheme();

  async function handleSignOut() {
    await sessionWritter.deleteCurrent();
    window.location.href = routes.CONTEST_SIGN_IN(contestMetadata.slug);
  }

  const isAuthorized = !!session?.member;

  return (
    <Navbar
      maxWidth="full"
      className="bg-content1 border-divider border-b"
      data-testid="header"
    >
      <Navbar.Brand className="min-w-0 flex-shrink">
        <p
          className="mr-3 max-w-full truncate text-lg font-semibold"
          data-testid="title"
        >
          {contestMetadata.title}
        </p>
        <ContestStatusChip status={contestStatus} data-testid="status" />
      </Navbar.Brand>
      <Navbar.Content justify="center">
        {contestStatus !== ContestStatus.NOT_STARTED && (
          <CountdownClock
            className="font-mono text-sm"
            to={new Date(contestMetadata.endAt)}
            data-testid="countdown-clock"
          />
        )}
      </Navbar.Content>
      <Navbar.Content justify="end">
        <Switch
          size="sm"
          color="default"
          isSelected={theme === Theme.DARK}
          onChange={toggleTheme}
          thumbIcon={({ isSelected, className }) =>
            isSelected ? (
              <MoonIcon className={className} data-testid="moon-icon" />
            ) : (
              <SunIcon className={className} data-testid="sun-icon" />
            )
          }
          data-testid="theme-switch"
        />
        {isAuthorized && (
          <Dropdown>
            <Dropdown.Trigger data-testid="user-dropdown-trigger">
              <Button variant="light">
                {session.member.name}
                <ChevronDownIcon className="h-3" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Menu disabledKeys={["member-type"]}>
              <Dropdown.Item
                key="member-type"
                isReadOnly
                data-testid="member-type"
              >
                <p className="font-semibold">
                  <FormattedMessage
                    {...globalMessages.memberType[session.member.type]}
                  />
                </p>
              </Dropdown.Item>
              <Dropdown.Item
                key="sign-out"
                color="danger"
                onClick={handleSignOut}
                data-testid="sign-out"
              >
                <FormattedMessage {...messages.signOut} />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
        {!isAuthorized &&
          pathname !== routes.CONTEST_SIGN_IN(contestMetadata.slug) && (
            <Button
              color="primary"
              variant="flat"
              onPress={() =>
                router.push(routes.CONTEST_SIGN_IN(contestMetadata.slug))
              }
              data-testid="sign-in"
            >
              <FormattedMessage {...messages.signIn} />
            </Button>
          )}
      </Navbar.Content>
    </Navbar>
  );
}
