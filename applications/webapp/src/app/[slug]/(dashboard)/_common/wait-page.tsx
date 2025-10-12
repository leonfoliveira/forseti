import React from "react";

import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";
import { CountdownClock } from "@/lib/component/countdown-clock";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { useAppSelector } from "@/store/store";

const messages = defineMessages({
  startAt: {
    id: "app.[slug].(dashboard)._common.wait-page.start-at",
    defaultMessage: "Starts in",
  },
  languages: {
    id: "app.[slug].(dashboard)._common.wait-page.languages",
    defaultMessage: "Supported languages",
  },
});

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage() {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);

  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl mb-5" data-testid="title">
          {contestMetadata.title}
        </h1>
        <div>
          <p className="font-semibold" data-testid="description">
            <FormattedMessage {...messages.startAt} />
          </p>
          <p className="text-2xl mt-2">
            <CountdownClock
              to={new Date(contestMetadata.startAt)}
              data-testid="clock"
            />
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
