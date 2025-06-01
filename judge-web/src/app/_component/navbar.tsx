import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_component/form/button";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { authorizationService } from "@/app/_composition";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/app/_util/theme-hook";
import { formatDifference } from "@/app/_util/date-utils";
import { useTranslations } from "next-intl";

type Props = {
  contest?: ContestSummaryResponseDTO;
  signInPath: string;
  "data-testid"?: string;
};

export function Navbar({ contest, signInPath, ...props }: Props) {
  const router = useRouter();
  const authorization = useAuthorization();
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("_component.navbar");

  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contest) {
      const interval = setInterval(() => {
        if (clockRef.current) {
          const diff = Math.max(
            0,
            new Date(contest.endAt).getTime() - new Date().getTime(),
          );
          clockRef.current.textContent = formatDifference(diff);

          if (diff / 1000 / 60 < 20) {
            clockRef.current.classList.add("text-error");
          }

          if (diff === 0) {
            clearInterval(interval);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [contest]);

  function signOut() {
    authorizationService.deleteAuthorization();
    router.push(signInPath);
  }

  return (
    <nav className="navbar bg-base-100" data-testid="navbar" {...props}>
      <div className="navbar-start">
        <div className="text-lg font-semibold" data-testid="navbar-title">
          {contest?.title}
        </div>
      </div>
      <div className="navbar-center">
        <span ref={clockRef} className="font-mono" data-testid="navbar-clock" />
      </div>
      <div className="navbar-end flex items-center">
        <label className="toggle text-base-content mr-5">
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
        <p className="mr-5" data-testid="navbar-member">
          {authorization?.member.name || t("guest")}
        </p>
        <Button
          onClick={signOut}
          className="btn-soft"
          data-testid="navbar-signout"
        >
          {t("sign-out:label")}
        </Button>
      </div>
    </nav>
  );
}
