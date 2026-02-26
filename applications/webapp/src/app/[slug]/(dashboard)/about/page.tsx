"use client";

import { CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";

import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Theme, useTheme } from "@/app/_lib/provider/theme-provider";
import { useAppSelector } from "@/app/_store/store";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard).about.page-title",
    defaultMessage: "Forseti - About",
  },
  pageDescription: {
    id: "app.[slug].(dashboard).about.page-description",
    defaultMessage: "View contest details and settings.",
  },
  startAt: {
    id: "app.[slug].(dashboard).about.start-at",
    defaultMessage: "Start At",
  },
  endAt: {
    id: "app.[slug].(dashboard).about.end-at",
    defaultMessage: "End At",
  },
  autoFreezeAt: {
    id: "app.[slug].(dashboard).about.auto-freeze-at",
    defaultMessage: "Auto Freeze At",
  },
  autoFreezeDisabled: {
    id: "app.[slug].(dashboard).about.auto-freeze-disabled",
    defaultMessage: "Disabled",
  },
  languages: {
    id: "app.[slug].(dashboard).about.languages",
    defaultMessage: "Supported languages",
  },
  settings: {
    id: "app.[slug].(dashboard).about.settings",
    defaultMessage: "Settings",
  },
  settingIsAutoJudgeEnabled: {
    id: "app.[slug].(dashboard).about.setting-is-auto-judge-enabled",
    defaultMessage: "Auto Judge",
  },
});

export default function DashboardAboutPage() {
  const contest = useAppSelector((state) => state.contest);
  const { theme } = useTheme();

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <Card className="my-5">
          <CardContent>
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-6">
              {theme === Theme.DARK ? (
                <Image
                  src="/icon-dark.png"
                  alt="Logo of forseti"
                  width={84}
                  height={84}
                />
              ) : (
                <Image
                  src="/icon-light.png"
                  alt="Logo of forseti"
                  width={84}
                  height={84}
                />
              )}

              <div className="mt-4 text-center sm:mt-0 sm:text-left">
                <h1
                  className="text-2xl font-semibold sm:text-3xl"
                  data-testid="title"
                >
                  {contest.title}
                </h1>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-3">
              <section>
                <p className="mb-2 font-medium">
                  <FormattedMessage {...messages.startAt} />
                </p>
                <p className="text-sm" data-testid="start-at">
                  <FormattedDateTime timestamp={contest.startAt} />
                </p>
              </section>
              <section>
                <p className="mb-2 font-medium">
                  <FormattedMessage {...messages.endAt} />
                </p>
                <p className="text-sm" data-testid="end-at">
                  <FormattedDateTime timestamp={contest.endAt} />
                </p>
              </section>
              <section>
                <p className="mb-2 font-medium">
                  <FormattedMessage {...messages.autoFreezeAt} />
                </p>
                <p className="text-sm" data-testid="auto-freeze-at">
                  {contest.autoFreezeAt ? (
                    <FormattedDateTime timestamp={contest.autoFreezeAt} />
                  ) : (
                    <span className="text-red-600 dark:text-red-700">
                      <FormattedMessage {...messages.autoFreezeDisabled} />
                    </span>
                  )}
                </p>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <section>
                <p className="mb-2 font-medium">
                  <FormattedMessage {...messages.languages} />
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    {contest.languages.map((lang) => (
                      <Badge
                        key={lang}
                        className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
                        data-testid={`language-${lang}`}
                      >
                        <FormattedMessage
                          {...globalMessages.submissionLanguage[
                            lang as keyof typeof globalMessages.submissionLanguage
                          ]}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-2 font-medium" data-testid="settings">
                  <FormattedMessage {...messages.settings} />
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="bg-muted/30 inline-flex h-7 w-7 items-center justify-center rounded-full">
                      {contest.settings.isAutoJudgeEnabled ? (
                        <CheckIcon
                          className="h-4 w-4 stroke-green-500"
                          data-testid="auto-judge-enabled"
                        />
                      ) : (
                        <XIcon
                          className="h-4 w-4 stroke-red-500"
                          data-testid="auto-judge-disabled"
                        />
                      )}
                    </span>
                    <span>
                      <FormattedMessage
                        {...messages.settingIsAutoJudgeEnabled}
                      />
                    </span>
                  </li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
