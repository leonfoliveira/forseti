import { useRouter } from "next/navigation";
import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { routes } from "@/config/routes";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { globalMessages } from "@/i18n/global";

const messages = defineMessages({
  startAt: {
    id: "app.contests.[slug]._common.wait-page.start-at",
    defaultMessage: "Starts at",
  },
  languages: {
    id: "app.contests.[slug]._common.wait-page.languages",
    defaultMessage: "Supported languages",
  },
});

type Props = {
  contestMetadata: ContestMetadataResponseDTO;
};

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage({ contestMetadata }: Props) {
  const router = useRouter();

  const clockRef = useWaitClock(new Date(contestMetadata.startAt), () =>
    router.push(routes.CONTEST_SIGN_IN(contestMetadata.slug)),
  );

  return (
    <div className="h-dvh flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl mb-5" data-testid="title">
          {contestMetadata.title}
        </h1>
        <div>
          <p className="font-semibold" data-testid="start-at">
            <FormattedMessage {...messages.startAt} />
          </p>
          <p className="text-2xl mt-2">
            <span ref={clockRef} />
          </p>
        </div>
        <div className="mt-10">
          <p className="font-semibold" data-testid="languages">
            <FormattedMessage {...messages.languages} />
          </p>
          <ul>
            {contestMetadata.languages.map((it) => (
              <li key={it} data-testid="language-item">
                <FormattedMessage {...globalMessages.language[it]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
