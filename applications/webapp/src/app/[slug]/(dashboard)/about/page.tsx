"use client";

import { FormattedDateTime } from "@/app/_lib/component/i18n/FormattedDateTime";
import { Page } from "@/app/_lib/component/page/Page";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useAppSelector } from "@/app/_lib/store/Store";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";

export default function DashboardAboutPage() {
  const contest = useAppSelector((state) => state.contest);

  return (
    <Page title="Forseti - About" description="About the contest">
      <div className="mx-auto my-5 w-full max-w-4xl">
        <Card>
          <CardContent>
            <h1
              className="text-center text-2xl font-semibold"
              data-testid="title"
            >
              {contest.title}
            </h1>
            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-[repeat(3,1fr)] gap-6 text-center">
                <section>
                  <p className="mb-2 font-medium">Start At</p>
                  <p className="text-sm" data-testid="start-at">
                    <FormattedDateTime timestamp={contest.startAt} />
                  </p>
                </section>
                <section>
                  <p className="mb-2 font-medium">End At</p>
                  <p className="text-sm" data-testid="end-at">
                    <FormattedDateTime timestamp={contest.endAt} />
                  </p>
                </section>
              </div>

              <div className="mt-6 text-center">
                <section>
                  <p className="mb-2 font-medium">Languages</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      {contest.languages.map((lang) => (
                        <Badge
                          key={lang}
                          className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
                          data-testid={`language-${lang}`}
                        >
                          {EnumeratedTextUtil.getSubmissionLanguage(lang)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
