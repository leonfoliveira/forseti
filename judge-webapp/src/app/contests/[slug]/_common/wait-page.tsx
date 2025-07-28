import React from "react";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { useRouter } from "next/navigation";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { routes } from "@/config/routes";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

type Props = {
  contestMetadata: ContestMetadataResponseDTO;
};

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage({ contestMetadata }: Props) {
  const router = useRouter();

  const { formatLanguage } = useContestFormatter();
  const clockRef = useWaitClock(new Date(contestMetadata.startAt), () =>
    router.push(routes.CONTEST_SIGN_IN(contestMetadata.slug)),
  );
  const t = useTranslations("contests.[slug]._common.wait-page");

  return (
    <div className="h-dvh flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl mb-5" data-testid="title">
          {contestMetadata.title}
        </h1>
        <div>
          <p className="font-semibold" data-testid="start-at">
            {t("start-at")}
          </p>
          <p className="text-2xl mt-2">
            <span ref={clockRef} />
          </p>
        </div>
        <div className="mt-10">
          <p className="font-semibold" data-testid="languages">
            {t("languages")}
          </p>
          <ul>
            {contestMetadata.languages.map((it) => (
              <li key={it} data-testid="language-item">
                {formatLanguage(it)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
