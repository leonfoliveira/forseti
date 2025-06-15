import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useTheme } from "@/app/_util/theme-hook";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useTranslations } from "next-intl";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { redirect, RedirectType } from "next/navigation";

type Props = {
  contestMetadata?: ContestMetadataResponseDTO;
  signInPath: string;
};

export function Navbar({ contestMetadata, signInPath }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { authorization } = useAuthorization();
  const t = useTranslations("_component.navbar");

  const clockRef = useWaitClock(
    contestMetadata && new Date(contestMetadata.endAt),
  );

  function signOut() {
    redirect(signInPath, RedirectType.push);
  }

  return (
    <nav className="navbar bg-base-100" data-testid="navbar">
      <div className="grid [grid-template-columns:1fr_auto_1fr] items-center w-full">
        <div className="text-lg font-semibold ml-2">
          {contestMetadata ? contestMetadata.title : t("root-title")}
        </div>
        <div className="text-center">
          <span
            ref={clockRef}
            className="font-mono text-sm"
            data-testid="navbar-clock"
          />
        </div>
        <div className="flex items-center w-full justify-end">
          <label className="toggle text-base-content">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === "dark"}
              onChange={toggleTheme}
              data-testid="navbar-theme"
            />
            <FontAwesomeIcon icon={faSun} size="xs" />
            <FontAwesomeIcon icon={faMoon} size="xs" />
          </label>
          <ul className="menu menu-horizontal">
            <li>
              <details>
                <summary className="font-semibold">
                  {authorization?.member.name || t("guest-name")}
                </summary>
                <ul className="bg-base-100 rounded-t-none right-0 !mt-0">
                  <li className="menu-title">
                    {t(`member-type.${authorization?.member.type || "GUEST"}`)}
                  </li>
                  <li>
                    <a onClick={signOut} className="text-nowrap">
                      {authorization?.member
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
