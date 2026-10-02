"use client";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

/**
 * Displays a page with the given title and description in the metadata, and renders the children.
 * This is used as a wrapper for all pages in the dashboard to provide consistent metadata and layout.
 */
export function Page({ title, description, children }: Props) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {children}
    </>
  );
}
