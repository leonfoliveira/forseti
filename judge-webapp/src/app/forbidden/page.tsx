"use client";

import { useTranslations } from "next-intl";
import { ErrorPageTemplate } from "@/app/_component/error-page-template";

export default function ForbiddenPage() {
  const t = useTranslations("forbidden");

  return <ErrorPageTemplate code={403} description={t("description")} />;
}
