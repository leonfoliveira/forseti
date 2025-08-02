import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useTheme } from "@/app/_util/theme-hook";
import { useAuthorization } from "@/app/_context/authorization-context";
import { useTranslations } from "next-intl";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { redirect, RedirectType } from "next/navigation";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

type Props = {
  contestMetadata?: ContestMetadataResponseDTO;
  signInPath: string;
};

export function Navbar({ contestMetadata, signInPath }: Props) {
  const { theme, toggleTheme } = useTheme();
  const authorization = useAuthorization();
  const { formatMemberType } = useContestFormatter()
  const t = useTranslations("_component.navbar");

  const clockRef = useWaitClock(
    contestMetadata && new Date(contestMetadata.endAt),
  );

  function signOut() {
    redirect(signInPath, RedirectType.push);
  }

  const isGuest = !authorization?.member || authorization.member.type === MemberType.ROOT;

  return (
    <nav className="navbar bg-base-100">
      <div className="grid [grid-template-columns:1fr_auto_1fr] items-center w-full">
        <div className="text-lg font-semibold ml-2" data-testid="title">
          {contestMetadata ? contestMetadata.title : t("root-title")}
        </div>
        <div className="text-center">
          <span ref={clockRef} className="font-mono text-sm" />
        </div>
        <div className="flex items-center w-full justify-end">
          <label className="toggle text-base-content">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === "dark"}
              onChange={toggleTheme}
              data-testid="theme"
            />
            <FontAwesomeIcon icon={faSun} size="xs" />
            <FontAwesomeIcon icon={faMoon} size="xs" />
          </label>
          <ul className="menu menu-horizontal">
            <li>
              <details>
                <summary className="font-semibold" data-testid="member">
                  {authorization?.member.name || t("guest-name")}
                </summary>
                <ul
                  className="bg-base-100 rounded-t-none right-0 !mt-0"
                  data-testid="menu"
                >
                  {!isGuest && (
                    <li className="menu-title">
                      {formatMemberType(authorization?.member.type)}
                    </li>
                  )}
                  <li>
                    <a
                      onClick={signOut}
                      className="text-nowrap"
                      data-testid="sign"
                    >
                      {!isGuest
                        ? t("sign-out:label")
                        : t("sign-in:label")}
                    </a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
