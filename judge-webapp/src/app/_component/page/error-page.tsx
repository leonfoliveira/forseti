import React from "react";
import { Button } from "@/app/_component/form/button";
import { useTranslations } from "next-intl";

/**
 * ErrorPage component displays an error message and a button to reload the page.
 */
export function ErrorPage() {
  const t = useTranslations("_component.page.error-page");
  return (
    <div
      className="h-dvh flex justify-center items-center"
      data-testid="error-page"
    >
      <div className="text-center">
        <h1 className="text-6xl mb-5 font-mono">{t("error")}</h1>
        <Button
          className="btn-soft mt-5"
          onClick={() => window.location.reload()}
        >
          {t("reload:label")}
        </Button>
      </div>
    </div>
  );
}
