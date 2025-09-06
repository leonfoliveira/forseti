"use client";

import { ChevronDownIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Switch,
} from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";
import { signOut } from "@/lib/action/auth-action";
import { ContestStatusChip } from "@/lib/component/chip/contest-status-chip";
import { CountdownClock } from "@/lib/component/countdown-clock";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { useContestStatusWatcher } from "@/lib/util/contest-status-watcher";
import { Theme, useTheme } from "@/lib/util/theme-hook";
import { useAppSelector } from "@/store/store";

const messages = defineMessages({
  signIn: {
    id: "lib.component.header.sign-in",
    defaultMessage: "Sign In",
  },
  signOut: {
    id: "lib.component.header.sign-out",
    defaultMessage: "Sign Out",
  },
});

export function Header() {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const authorization = useAppSelector((state) => state.authorization);
  const contestStatus = useContestStatusWatcher();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  async function handleSignOut() {
    await signOut();
    window.location.href = routes.CONTEST_SIGN_IN(contestMetadata.slug);
  }

  const isAuthorized = !!authorization?.member;

  return (
    <Navbar
      maxWidth="full"
      className="bg-content1 border-b border-divider"
      data-testid="header"
    >
      <NavbarBrand className="min-w-0 flex-shrink">
        <p
          className="text-lg font-semibold truncate max-w-full mr-3"
          data-testid="title"
        >
          {contestMetadata.title}
        </p>
        <ContestStatusChip status={contestStatus} data-testid="status" />
      </NavbarBrand>
      <NavbarContent justify="center">
        {contestStatus !== ContestStatus.NOT_STARTED && (
          <CountdownClock
            className="font-mono text-sm"
            to={new Date(contestMetadata.endAt)}
            data-testid="countdown-clock"
          />
        )}
      </NavbarContent>
      <NavbarContent justify="end">
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
            <DropdownTrigger data-testid="user-dropdown-trigger">
              <Button variant="light">
                {authorization.member.name}
                <ChevronDownIcon className="h-3" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu disabledKeys={["member-type"]}>
              <DropdownItem
                key="member-type"
                isReadOnly
                data-testid="member-type"
              >
                <p className="font-semibold">
                  <FormattedMessage
                    {...globalMessages.memberType[authorization.member.type]}
                  />
                </p>
              </DropdownItem>
              <DropdownItem
                key="sign-out"
                color="danger"
                onClick={handleSignOut}
                data-testid="sign-out"
              >
                <FormattedMessage {...messages.signOut} />
              </DropdownItem>
            </DropdownMenu>
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
      </NavbarContent>
    </Navbar>
  );
}
