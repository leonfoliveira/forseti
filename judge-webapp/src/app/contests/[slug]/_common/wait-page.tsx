import React from "react";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { useRouter } from "next/navigation";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { routes } from "@/config/routes";

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage() {
  const contest = useContestMetadata();
  const router = useRouter();

  const { formatLanguage } = useContestFormatter();
  const clockRef = useWaitClock(new Date(contest.startAt), () =>
    router.push(routes.CONTEST_SIGN_IN(contest.slug)),
  );
  const t = useTranslations("contests.[slug]._common.wait-page");

  return (
    <div className="h-dvh flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl mb-5" data-testid="not-started:title">
          {contest.title}
        </h1>
        <div>
          <p className="font-semibold">{t("start-at")}</p>
          <p className="text-2xl mt-2" data-testid="not-started:start-at">
            <span ref={clockRef} />
          </p>
        </div>
        <div className="mt-10">
          <p className="font-semibold">{t("languages")}</p>
          <ul>
            {contest.languages.map((it) => (
              <li key={it}>{formatLanguage(it)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
