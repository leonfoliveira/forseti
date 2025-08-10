"use client";

import { useTranslations } from "next-intl";
import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";

export default function NotFoundPage() {
  const t = useTranslations("not-found");

  return <ErrorPageTemplate code={404} description={t("description")} />;
}
