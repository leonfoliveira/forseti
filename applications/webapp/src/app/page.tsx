"use client";

import Image from "next/image";

import { Page } from "@/app/_lib/component/page/Page";
import { Theme, useTheme } from "@/app/_lib/provider/ThemeProvider";

/**
 * The home page of the web application.
 * Displays the app logo and instructions for accessing contests.
 */
export default function HomePage() {
  const { theme } = useTheme();

  return (
    <Page title="Forseti" description="Forseti application.">
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <Image
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
              Welcome to Forseti Judge
            </h1>

            <div className="space-y-4 text-lg">
              <p
                className="text-base-content"
                data-testid="contest-access-info"
              >
                To access a contest, please use the correct contest URL format:
              </p>

              <div className="bg-base-200 rounded-lg p-4">
                <code
                  className="text-primary font-mono text-xl"
                  data-testid="url-format"
                >
                  {`'/{contest-slug}'`}
                </code>
              </div>

              <p
                className="text-base-content/70 text-sm"
                data-testid="url-format-description"
              >
                {`Replace '{contest-slug}' with your specific contest identifier.`}
              </p>

              <p
                className="text-base-content text-base"
                data-testid="contact-admin"
              >
                {`If you don't have a contest URL, please contact your contest administrator.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
