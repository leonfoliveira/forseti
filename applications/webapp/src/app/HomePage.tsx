import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Page } from "@/app/_lib/component/page/Page";
import { Theme, useTheme } from "@/app/_lib/provider/ThemeProvider";

/**
 * The home page of the web application.
 * Displays the app logo and instructions for accessing contests.
 */
export default function HomePage() {
  const { theme } = useTheme();

  return (
    <Page title="HomePage.pageTitle" description="HomePage.pageDescription">
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <img
            src={theme === Theme.DARK ? "/icon-dark.png" : "/icon-light.png"}
            alt="Logo of forseti"
            width={300}
            height={300}
            data-testid="logo-image"
            className="mx-auto mb-8"
          />

          <div className="max-w-2xl space-y-6">
            <h1
              className="text-primary text-4xl font-bold"
              data-testid="welcome-title"
            >
              <FormattedMessage id="HomePage.welcome" />
            </h1>

            <div className="space-y-4 text-lg">
              <p
                className="text-base-content"
                data-testid="contest-access-info"
              >
                <FormattedMessage id="HomePage.instructions1" />
              </p>

              <div className="bg-base-200 rounded-lg p-4">
                <code
                  className="text-primary font-mono text-xl"
                  data-testid="url-format"
                >
                  <FormattedMessage id="HomePage.path" />
                </code>
              </div>

              <p
                className="text-base-content/70 text-sm"
                data-testid="url-format-description"
              >
                <FormattedMessage id="HomePage.instructions2" />
              </p>

              <p
                className="text-base-content text-base"
                data-testid="contact-admin"
              >
                <FormattedMessage id="HomePage.instructions3" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
