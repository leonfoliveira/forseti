import React from "react";
import { Button } from "@/app/_component/form/button";
import { useTranslations } from "next-intl";

export function ErrorPage() {
  const t = useTranslations("contest.[slug]._component.error-page");

  return (
    <div className="h-dvh flex justify-center items-center">
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
