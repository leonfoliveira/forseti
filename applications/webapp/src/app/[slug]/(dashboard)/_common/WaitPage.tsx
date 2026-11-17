import { ClockAlertIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Page } from "@/app/_lib/component/page/Page";
import { useAppSelector } from "@/app/_lib/store/Store";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage() {
  const contestStartAt = useAppSelector((state) => state.contest.startAt);
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const startAt = new Date(contestStartAt);
    const timeout = startAt.getTime() - now.getTime();

    const MAX_TIMEOUT = 2147483647;

    if (timeout > 0) {
      if (timeout <= MAX_TIMEOUT) {
        const timer = setTimeout(() => {
          console.debug("Contest started. Reloading page...");
          navigate(0);
        }, timeout);

        return () => clearTimeout(timer);
      }
    } else {
      console.debug("Contest already started. Reloading page...");
      navigate(0);
    }
  }, [contestStartAt]);

  return (
    <Page
      title="[slug].(dashboard)._common.WaitPage.pageTitle"
      description="[slug].(dashboard)._common.WaitPage.pageDescription"
    >
      <div
        className="flex flex-1 items-center justify-center"
        data-testid="wait-page"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <ClockAlertIcon size={100} className="mb-5" />
          <p>
            <FormattedMessage id="[slug].(dashboard)._common.WaitPage.text1" />
          </p>
          <p>
            <FormattedMessage id="[slug].(dashboard)._common.WaitPage.text2" />
          </p>
        </div>
      </div>
    </Page>
  );
}
