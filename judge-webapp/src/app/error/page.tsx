"use client";

import { useTranslations } from "next-intl";
import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";

export default function ErrorPage() {
  const t = useTranslations("error");

  return <ErrorPageTemplate code={500} description={t("description")} />;
}
