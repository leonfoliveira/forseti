"use client";

import Image from "next/image";

import { CountdownClock } from "@/app/_lib/component/display/countdown-clock";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Theme, useTheme } from "@/app/_lib/provider/theme-provider";
import { useAppSelector } from "@/app/_store/store";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

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
  const { theme } = useTheme();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-5"
      data-testid="wait-page"
    >
      {theme === Theme.DARK ? (
        <Image
          src={"/icon-dark.png"}
          alt="Logo of forseti"
          width={100}
          height={100}
        />
      ) : (
        <Image
          src={"/icon-light.png"}
          alt="Logo of forseti"
          width={100}
          height={100}
        />
      )}
      <h1 className="text-4xl" data-testid="title">
        {contestMetadata.title}
      </h1>
      <Separator className="my-3 max-w-lg" />
      <div className="text-center">
        <p className="font-semibold" data-testid="description">
          <FormattedMessage {...messages.startAt} />
        </p>
        <div className="flex justify-center text-lg">
          <CountdownClock
            to={new Date(contestMetadata.startAt)}
            onZero={handleReload}
            data-testid="clock"
          />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold" data-testid="languages">
          <FormattedMessage {...messages.languages} />
        </p>
        <ul className="mt-1 text-sm">
          {contestMetadata.languages.toSorted().map((it) => (
            <li key={it} data-testid="language-item">
              <FormattedMessage {...globalMessages.submissionLanguage[it]} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
