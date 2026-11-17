import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";

type Props = {
  title: ParseKeys;
  description: ParseKeys;
  children: React.ReactNode;
};

/**
 * Displays a page with the given title and description in the metadata, and renders the children.
 * This is used as a wrapper for all pages in the dashboard to provide consistent metadata and layout.
 */
export function Page({ title, description, children }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <title>{t(title)}</title>
      <meta name="description" content={t(description)} />
      {children}
    </>
  );
}
