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

type Props = {
  contest?: ContestSummaryResponseDTO;
  signInPath: string;
};

export function Navbar({ contest, signInPath }: Props) {
  const router = useRouter();
  const authorization = useAuthorization();
  const { theme, toggleTheme } = useTheme();

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
    <nav className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="text-lg font-semibold">{contest?.title}</div>
      </div>
      <div className="navbar-center">
        <span ref={clockRef} />
      </div>
      <div className="navbar-end flex items-center">
        <label className="toggle text-base-content mr-5">
          <input
            type="checkbox"
            className="theme-controller"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <FontAwesomeIcon icon={faSun} size="xs" />
          <FontAwesomeIcon icon={faMoon} size="xs" />
        </label>
        <p className="mr-5">{authorization?.member.name}</p>
        <Button onClick={signOut} className="btn-soft">
          Sign out
        </Button>
      </div>
    </nav>
  );
}
