import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_component/form/button";
import { authorizationService } from "@/app/_composition";
import { useAuthorization } from "@/app/_util/authorization-hook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/app/_util/theme-hook";
import { useTranslations } from "next-intl";
import { useContest } from "@/app/contests/[slug]/_context";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";

type Props = {
  "data-testid"?: string;
};

export function ContestNavbar(props: Props) {
  const router = useRouter();
  const authorization = useAuthorization();
  const { contest } = useContest();
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("contests.[slug]._component.contest-navbar");

  const clockRef = useWaitClock(new Date(contest.endAt));

  function signOut() {
    authorizationService.deleteAuthorization();
    router.push(`/auth/contests/${contest.slug}`);
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
        {!!authorization && (
          <p className="mr-5" data-testid="navbar-member">
            {authorization?.member.name}
          </p>
        )}
        {!!authorization ? (
          <Button
            onClick={signOut}
            className="btn-soft"
            data-testid="navbar-signout"
          >
            {t("sign-out:label")}
          </Button>
        ) : (
          <Button
            onClick={() => router.push(`/auth/contests/${contest.slug}`)}
            className="btn-soft"
            data-testid="navbar-signin"
          >
            {t("sign-in:label")}
          </Button>
        )}
      </div>
    </nav>
  );
}
